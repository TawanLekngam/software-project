import { db } from "@/lib/db";
import PdfViewer from "./_components/pdf-viewer";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const documentPage = async ({
  params,
}: {
  params: {
    courseId: string;
    chapterId: string;
    documentId: string;
  };
}) => {
  const document = await db.document.findUnique({
    where: {
      id: params.documentId,
    },
  });

  if (!document) {
    return redirect("/");
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <div className="flex-grow">
          <div className="container mx-auto justify-center max-w-[900px]">
            <div className="self-start pt-6">
              <Link
                href={`/courses/${params.courseId}/chapters/${params.chapterId}`}
              >
                <Button variant={"underline"}>
                  <ChevronLeft />
                  back
                </Button>
              </Link>
            </div>
            <div className="flex flex-col items-center justify-center px-24 py-6 gap-6">
              <h1 className="text-xl md:text-2xl font-extrabold text-black ">
                {document.title}
              </h1>
              <div className="w-[700px] p-6 items-center">
                <PdfViewer url={document.url} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default documentPage;
