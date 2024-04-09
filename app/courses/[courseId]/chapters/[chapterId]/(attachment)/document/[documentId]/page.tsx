import { db } from "@/lib/db";
import PdfViewer from "./_components/pdf-viewer";
import { redirect } from "next/navigation";

const documentPage = async ({
  params,
}: {
  params: {
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
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <div className="flex-grow">
          <section className="flex flex-col w-screen items-center justify-center p-6">
            <div className="self-start">back</div>
            <h1 className="text-xl md:text-2xl font-extrabold text-black ">
              {document.title}
            </h1>
            <div className="w-[700px] p-6 items-center">
              <PdfViewer url={document.url} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default documentPage;
