import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pdfParse from "pdf-parse";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No PDF file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse PDF text
    const pdfData = await pdfParse(buffer);
    const pdfText = pdfData.text;

    // Send text to Gemini to extract workout plans
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `Extract the workout routine from this text. Return a JSON array of objects, where each object represents a WorkoutPlan.
Format:
[
  {
    "name": "Push Day / Chest Day",
    "dayOfWeek": 1, // 1 for Monday, 2 for Tue, etc.
    "exercises": [
      {
        "name": "Bench Press",
        "targetSets": 3,
        "targetReps": 10
      }
    ]
  }
]
IMPORTANT: Return ONLY valid JSON, starting with [ and ending with ]. Do not include markdown codeblocks (\`\`\`json) or any other text. If no reps/sets are found, use default 3 sets of 10.
Text:
${pdfText}
`;

    const result = await model.generateContent(prompt);
    let textResponse = result.response.text().trim();

    // Clean up any potential markdown formatting from Gemini response
    if (textResponse.startsWith("```json")) {
      textResponse = textResponse.replace(/^```json\n?/, "");
      textResponse = textResponse.replace(/```$/, "");
    } else if (textResponse.startsWith("```")) {
      textResponse = textResponse.replace(/^```\w*\n?/, "");
      textResponse = textResponse.replace(/```$/, "");
    }

    textResponse = textResponse.trim();

    let parsedPlans;
    try {
      parsedPlans = JSON.parse(textResponse);
    } catch {
      console.error("Failed to parse JSON from Gemini:", textResponse);
      return NextResponse.json({ error: "Failed to understand workout format" }, { status: 500 });
    }

    if (!Array.isArray(parsedPlans)) {
       return NextResponse.json({ error: "Invalid response format from AI" }, { status: 500 });
    }

    type ParsedExercise = { name?: string; targetSets?: number; targetReps?: number; };
    const createdPlans = [];

    // Save to database
    for (const plan of parsedPlans) {
      const createdPlan = await prisma.workoutPlan.create({
        data: {
          userId: session.user.id,
          name: plan.name || "Workout Plan",
          dayOfWeek: plan.dayOfWeek || null
        }
      });
      
      const planExercisesData = [];
      const exercisesArr = (plan.exercises || []) as ParsedExercise[];
      for (const ex of exercisesArr) {
         const name = ex.name || "Unknown Exercise";
         let globalEx = await prisma.exercise.findFirst({ where: { name } });
         if (!globalEx) {
             globalEx = await prisma.exercise.create({ data: { name } });
         }
         const px = await prisma.planExercise.create({
             data: {
                 workoutPlanId: createdPlan.id,
                 exerciseId: globalEx.id,
                 targetSets: ex.targetSets || 3,
                 targetReps: ex.targetReps || 10
             }
         });
         planExercisesData.push(px);
      }
      
      createdPlans.push({ ...createdPlan, planExercises: planExercisesData });
    }

    return NextResponse.json({ success: true, data: createdPlans });

  } catch (error) {
    console.error("PDF Parsing/LLM Error:", error);
    return NextResponse.json({
      error: "Failed to process workout PDF",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
