import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ChevronLeft, PencilRuler } from "lucide-react";
import { Actions } from "./_components/actions";
import { Banner } from "@/components/banner";
import { VideoTitleForm } from "./_components/video-title-form";
import { ChapterVideoForm } from "./_components/video-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const video = async ({
  params,
}: {
  params: { courseId: string; chapterId: string; videoId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const video = await db.video.findUnique({
    where: {
      id: params.videoId,
    },
  });

  if (!video) {
    return redirect("/");
  }

  const requiredFields = [1];
  const isComplete = requiredFields.every(Boolean);

  return (
    <>
      {!video.isPublished && (
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
            <h1 className="text-2xl font-medium">Videos</h1>
          </div>

          <Actions
            disabled={!isComplete}
            courseId={params.courseId}
            chapterId={params.chapterId}
            videoId={params.videoId}
            isPublished={video.isPublished}
          />
        </div>

        <div className="flex flex-col gap-8 w-4/5 max-w-7xl justify-center">
          <VideoTitleForm
            initialData={video}
            courseId={params.courseId}
            chapterId={params.chapterId}
            videoId={params.videoId}
          />
          <hr className="border-t-4 rounded-md border-gray-400" />
          <ChapterVideoForm
            initialData={video}
            chapterId={params.chapterId}
            courseId={params.courseId}
            videoId={params.videoId}
          />
        </div>
      </div>
    </>
  );
};
export default video;
