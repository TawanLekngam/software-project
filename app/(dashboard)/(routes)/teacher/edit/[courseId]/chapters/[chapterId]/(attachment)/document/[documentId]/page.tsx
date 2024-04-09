import { auth } from "@clerk/nextjs";
import { DocumentForm } from "./_components/document-form";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronLeft, PencilRuler } from "lucide-react";
import { Actions } from "./_components/actions";
import { Banner } from "@/components/banner";
import { DocumentTitleForm } from "./_components/document-title-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const Document = async ({
  params,
}: {
  params: { courseId: string; chapterId: string; documentId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const document = await db.document.findUnique({
    where: {
      id: params.documentId,
    },
  });

  if (!document) {
    return redirect("/");
  }

  const requiredFields = [document.title, document.url];
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!document.isPublished && (
        <Banner label="This PDF is unpublished. It will not be visible to the students." />
      )}
      <div className="flex flex-col items-center justify-center w-full px-4 py-16 gap-8 ">
        <div className="flex items-center w-4/5 max-w-7xl justify-between">
          <Link
            href={`/teacher/edit/${params.courseId}/chapters/${params.chapterId}`}
          >
            <Button variant={"underline"}>
              <ChevronLeft />
              back
            </Button>
          </Link>
          <div className="flex flex-row gap-2 items-center justify-center">
            <PencilRuler />
            <h1 className="text-2xl font-medium">PDF Files</h1>
          </div>
          <Actions
            disabled={!isComplete}
            courseId={params.courseId}
            chapterId={params.chapterId}
            documentId={params.documentId}
            isPublished={document.isPublished}
          />
        </div>

        <div className="flex flex-col gap-8 w-4/5 max-w-7xl justify-center">
          <DocumentTitleForm
            initialData={document}
            courseId={params.courseId}
            chapterId={params.chapterId}
            documentId={params.documentId}
          />
          <hr className="border-t-4 rounded-md border-gray-400" />
          <DocumentForm
            initialData={document}
            courseId={params.courseId}
            chapterId={params.chapterId}
            documentId={params.documentId}
          />
        </div>
      </div>
    </>
  );
};
export default Document;
