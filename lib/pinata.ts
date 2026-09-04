export type PinataUploadResult = {
  cid: string;
  url: string;
};

export async function uploadImageToPinata(
  dataUrl: string,
  filename: string
): Promise<PinataUploadResult> {
  const sourceResponse = await fetch(dataUrl);
  const blob = await sourceResponse.blob();

  const formData = new FormData();
  formData.append("file", blob, filename);

  const response = await fetch("/api/pinata/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(errorPayload?.error ?? "Pinata upload failed");
  }

  return response.json();
}
