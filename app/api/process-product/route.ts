import { NextResponse } from "next/server";
import { processProductWorkflow } from "@/lib/modules/product/product.workflow";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const result = await processProductWorkflow(body);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      { error: error.message || "Processing failed" },
      { status: 500 },
    );
  }
}
