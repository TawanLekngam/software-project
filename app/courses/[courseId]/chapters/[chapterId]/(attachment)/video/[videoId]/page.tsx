import { db } from "@/lib/db";
import { VideoPlayer } from "./_components/video-player";
import { redirect } from "next/navigation";
const videoPage = async ({
  params,
}: {
  params: {
    courseId: string;
    chapterId: string;
    videoId: string;
  };
}) => {
  const video = await db.video.findUnique({
    where: {
      id: params.videoId,
    },
    include: {
      muxData: true,
    },
  });

  if (!video) {
    return redirect("/");
  }

  const playbackId = video.muxData[0]?.playbackId;
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <div className="flex-grow">
        <section className="flex flex-col w-screen items-center justify-center p-6">
          <div className="self-start">back</div>
          <h1 className="text-xl md:text-2xl font-extrabold text-black ">
            {video.title}
          </h1>
          <div className="w-[700px] p-6 items-center">
            <VideoPlayer
              playbackId={playbackId!}
              courseId={params.courseId}
              chapterId={params.chapterId}
              completeOnEnd={false}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default videoPage;
