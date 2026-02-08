"use client";

import { useState, useRef, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2, Link2, ImageDown, Download } from "lucide-react";
import { toast } from "sonner";
import {
  RecordCertificatePreview,
  type RecordCertificatePreviewProps,
} from "@/components/record-certificate-preview";

type ShareRecordMenuProps = {
  eventId: string;
  courseId: string;
  year: string;
  time: string;
  title: string;
  description: string;
  certificateProps: RecordCertificatePreviewProps;
};

export default function ShareRecordMenu({
  eventId,
  courseId,
  year,
  time,
  title,
  description,
  certificateProps,
}: ShareRecordMenuProps) {
  const [open, setOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [scale, setScale] = useState(0.2);
  const containerRef = useRef<HTMLDivElement>(null);

  const basePath = `/find-by-record/${eventId}/${courseId}/${year}/${time}`;
  const getShareUrl = () =>
    typeof window !== "undefined"
      ? `${window.location.origin}${basePath}`
      : "";
  const getOgImageUrl = () => `${getShareUrl()}/opengraph-image`;

  const updateScale = () => {
    if (!containerRef.current) return;
    const w = containerRef.current.clientWidth;
    if (w > 0) {
      setScale(w / 1080);
    }
  };

  useEffect(() => {
    if (!imageModalOpen) return;
    const runUpdate = () => updateScale();
    const t1 = requestAnimationFrame(runUpdate);
    const t2 = setTimeout(runUpdate, 50);
    const t3 = setTimeout(runUpdate, 150);
    const el = containerRef.current;
    const ro = el
      ? (() => {
          const r = new ResizeObserver(runUpdate);
          r.observe(el);
          return r;
        })()
      : null;
    return () => {
      cancelAnimationFrame(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      ro?.disconnect();
    };
  }, [imageModalOpen]);

  const handleCopyLink = async () => {
    const url = getShareUrl();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다.");
      setOpen(false);
    } catch {
      toast.error("링크 복사에 실패했습니다.");
    }
  };

  const handleShare = async () => {
    const url = getShareUrl();
    if (!url) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
        toast.success("공유되었습니다.");
        setOpen(false);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("공유에 실패했습니다.");
        }
      }
    } else {
      await handleCopyLink();
    }
  };

  const openImageModal = () => {
    setOpen(false);
    setImageModalOpen(true);
  };

  const handleConfirmDownload = async () => {
    const url = getShareUrl();
    if (!url) return;
    setIsDownloading(true);
    try {
      const ogImageUrl = getOgImageUrl();
      const res = await fetch(ogImageUrl);
      if (!res.ok) throw new Error("Failed to fetch image");
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `kfondo-record-${eventId}-${year}-${time}.png`;
      a.click();
      URL.revokeObjectURL(objectUrl);
      toast.success("이미지가 다운로드되었습니다.");
    } catch {
      toast.error("이미지 다운로드에 실패했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 shrink-0">
          <Share2 className="h-4 w-4" />
          공유
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-56 p-1"
      >
        <div className="flex flex-col gap-0.5">
          <Button
            variant="ghost"
            className="justify-start gap-2 h-9 px-2 text-sm font-normal"
            onClick={handleCopyLink}
          >
            <Link2 className="h-4 w-4 shrink-0" />
            링크 복사
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 h-9 px-2 text-sm font-normal"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4 shrink-0" />
            공유하기
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 h-9 px-2 text-sm font-normal"
            onClick={openImageModal}
          >
            <ImageDown className="h-4 w-4 shrink-0" />
            이미지로 저장
          </Button>
        </div>
      </PopoverContent>
    </Popover>

    {/* HTML 미리보기 및 다운로드 모달 */}
    <Dialog open={imageModalOpen} onOpenChange={setImageModalOpen}>
      <DialogContent className="!flex !flex-col !max-w-none !w-auto !translate-x-[-50%] !translate-y-[-50%] p-4 sm:rounded-lg">
        <DialogHeader className="shrink-0">
          <DialogTitle>기록 인증 이미지</DialogTitle>
        </DialogHeader>
        {/* HTML 렌더링된 인증서: 뷰포트 90%에 맞게 표시 */}
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-lg bg-muted/30"
          style={{
            width: `min(90vw, calc(85dvh * 1080 / 1350))`,
            aspectRatio: "1080 / 1350",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: 1080,
                height: 1350,
              }}
            >
              <RecordCertificatePreview {...certificateProps} />
            </div>
          </div>
        </div>
        <DialogFooter className="shrink-0">
          <Button
            onClick={handleConfirmDownload}
            disabled={isDownloading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isDownloading ? "다운로드 중…" : "다운로드"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
  );
}
