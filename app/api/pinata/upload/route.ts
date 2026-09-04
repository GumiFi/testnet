import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    return NextResponse.json({ error: "Pinata is not configured" }, { status: 500 });
  }

  const incomingForm = await request.formData();
  const file = incomingForm.get("file");
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  const outgoingForm = new FormData();
  const filename = file instanceof File ? file.name : "upload.png";
  outgoingForm.append("file", file, filename);

  const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: outgoingForm,
  });

  if (!pinataResponse.ok) {
    const errorText = await pinataResponse.text();
    return NextResponse.json({ error: errorText }, { status: 502 });
  }

  const payload = await pinataResponse.json();
  const cid = payload.IpfsHash as string;
  const gateway = (process.env.NEXT_PUBLIC_PINATA_GATEWAY || "https://gateway.pinata.cloud").replace(/\/$/, "");
  const url = `${gateway}/ipfs/${cid}`;

  return NextResponse.json({ cid, url });
}
