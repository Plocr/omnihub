import { revalidatePath } from "next/cache";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const secret = body.secret;

  if (secret !== process.env.REVALIDATION_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  const paths = ["/", "/explore", "/search"];

  try {
    paths.forEach((path) => revalidatePath(path));
    return Response.json({ revalidated: true, paths });
  } catch (err) {
    return Response.json(
      { error: "Revalidation failed", message: String(err) },
      { status: 500 },
    );
  }
}
