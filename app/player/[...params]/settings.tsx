import { Button } from "@/components/ui/button";
import { Level } from "hls.js";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconAntennaBars1,
  IconAntennaBars2,
  IconAntennaBars3,
  IconAntennaBars5,
  IconAntennaBarsOff,
  IconCheck,
  IconChevronRight,
  IconLanguageKatakana,
  IconMinus,
  IconPlus,
  IconRefresh,
  IconSelector,
  IconSettings,
  IconSettings2,
  IconSettingsBolt,
  IconSettingsFilled,
  IconSettingsOff,
  IconSettingsX,
  IconX,
} from "@tabler/icons-react";
import { ArrowLeft, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Subtitle } from "@/hook/subtitle-hooks";
import { ServerTypes } from "./hooks/useServerManager";
import { AudioTrackTypes } from "./hooks/useVideoSource";

type Props = {
  quality: Level[];
  selectedQualty: number;
  setSelectedQualty: (selectedQualty: number) => void;
  setServer: (server: number) => void;
  server: number;
  servers: ServerTypes[];
  lockTimer: () => void;
  resetTimer: () => void;
  audioTracks: AudioTrackTypes[];
  selectedAudio: number;
  setSelectedAudio: (selectedAudio: number) => void;
  data_sub: Subtitle[];
  selectedSub: string;
  setSelectedSub: (sub: string) => void;
  subtitleOffset: number;
  setSubtitleOffset: (offset: number | ((prev: number) => number)) => void;
};

export default function PlayerSettings({
  quality,
  selectedQualty,
  setSelectedQualty,
  setServer,
  servers,
  server,
  lockTimer,
  resetTimer,
  audioTracks,
  selectedAudio,
  setSelectedAudio,
  data_sub,
  selectedSub,
  setSelectedSub,
  subtitleOffset,
  setSubtitleOffset,
}: Props) {
  const [open, setOpen] = useState(false);
  const [openQuality, setOpenQuality] = useState(false);
  const [openServer, setOpenServer] = useState(false);
  const [openAudio, setOpenAudio] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const [openTiming, setOpenTiming] = useState(false);
  const showBack =
    openQuality || openServer || openAudio || openSub || openTiming;

  const handleButtonClick = () => {
    if (openQuality) return setOpenQuality(false);
    if (openServer) return setOpenServer(false);
    if (openAudio) return setOpenAudio(false);
    if (openSub) return setOpenSub(false);
    if (openTiming) return setOpenTiming(false);
    setOpen((prev) => !prev);
    if (open) {
      resetTimer();
    } else {
      lockTimer();
    }
  };
  console.log(":", data_sub);
  return (
    <div
      className="relative"
      onPointerMove={(e) => {
        e.stopPropagation();
        if (e.pointerType === "mouse") {
          lockTimer();
        }
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      onPointerUp={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Trigger Button */}
      <span
        onPointerMove={lockTimer}
        onClick={handleButtonClick}
        className=" relative"
      >
        <Button
          variant="outline"
          className="lg:w-45  justify-between backdrop-blur-md  border-0 lg:flex hidden"
        >
          {showBack ? <ArrowLeft /> : <IconSettings2 />}
          {showBack ? "Back" : "Settings"}
          <IconSelector />
        </Button>
        <span className="lg:hidden block text-gray-200">
          {showBack ? (
            <X className="size-7" />
          ) : (
            <Settings className="size-7" />
          )}
        </span>
      </span>

      {/* Dropdown */}
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2  mb-3 z-50 min-w-45 bg-card/80 backdrop-blur-2xl rounded-md overflow-hidden">
          {/* Subtitle List */}

          {openQuality && (
            <div>
              <h1 className="px-3 py-2 text-sm font-medium bg-background">
                Select Quality
              </h1>

              <div className="custom-scrollbar  overflow-auto">
                <SubtitleButton
                  label="Auto"
                  onClick={() => {
                    setSelectedQualty(-1);
                    setOpenQuality(false);
                  }}
                  active={-1 === selectedQualty}
                />

                {quality
                  .filter((f) => f.height !== 0)
                  .map((s, idx) => (
                    <SubtitleButton
                      key={idx}
                      active={idx === selectedQualty}
                      label={`${s.height}p`}
                      onClick={() => {
                        setSelectedQualty(idx);
                        setOpenQuality(false);
                      }}
                    />
                  ))}
              </div>
            </div>
          )}

          {openAudio && audioTracks.length > 0 && (
            <div>
              <h1 className="px-3 py-2 text-sm font-medium bg-background">
                Select Audio
              </h1>

              <div className="custom-scrollbar  overflow-x-hidden  max-h-[50dvh] ">
                {audioTracks.map((s, idx) => (
                  <Button
                    key={idx}
                    onClick={() => {
                      setSelectedAudio(idx);
                      setOpenAudio(false);
                    }}
                    variant={idx === selectedAudio ? "outline" : "ghost"}
                    className=" justify-between w-full rounded-none"
                  >
                    <p>{s.name.split("-").pop()?.trim()}</p>
                  </Button>

                  // <SubtitleButton
                  //   key={idx}
                  //   active={idx === selectedAudio}
                  //   label={`${s.name}`}
                  //   onClick={() => {
                  //     setSelectedAudio(idx);
                  //     setOpenAudio(false);
                  //   }}
                  // />
                ))}
              </div>
            </div>
          )}
          {/* {openServer && (
            <div>
              <h1 className="px-3 py-2 text-sm font-medium bg-background">
                Select Server
              </h1>

              <div className="custom-scrollbar  overflow-auto pb-2 pt-1">
                {servers.map((s, i) => (
                  <Button
                    key={i}
                    onClick={() => {
                      setServer(i);
                      setOpenServer(false);
                    }}
                    variant={s.server === server ? "outline" : "ghost"}
                    className=" justify-between w-full rounded-none"
                  >
                    <p>{s.name}</p>{" "}
                    <span>
                      {s.status === "queue" ? (
                        <IconAntennaBars1 className="text-gray-200" />
                      ) : s.status === "cancelled" ? (
                        <IconAntennaBars3 />
                      ) : s.status === "failed" ? (
                        <IconAntennaBarsOff className="text-red-800" />
                      ) : s.status === "available" ? (
                        <IconAntennaBars5 className="text-green-700" />
                      ) : s.status === "checking" ? (
                        <IconAntennaBars2 />
                      ) : (
                        ""
                      )}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          )} */}

          {/* Subtitle List */}
          {openSub && (
            <div>
              <h1 className="px-3 py-2 text-sm font-medium bg-background">
                Select Subtitle
              </h1>

              <div className="custom-scrollbar max-h-[50dvh] overflow-auto">
                <SubtitleButton
                  label="Unselect"
                  onClick={() => {
                    setSelectedSub("");
                    setOpenSub(false);
                  }}
                  active={"" === selectedSub}
                />

                {data_sub.map((s, idx) => (
                  <SubtitleButton
                    key={idx}
                    active={s.file === selectedSub}
                    label={s.label}
                    // flag={s.flagUrl}
                    onClick={() => {
                      setSelectedSub(s.file);
                      setOpenSub(false);
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          {/* Timing */}
          {openTiming &&
            (selectedSub ? (
              <div className="space-y-3 p-2">
                {/* Offset Display */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Offset:</span>
                  <span className="text-lg font-mono font-semibold  ">
                    {subtitleOffset >= 0 && "+"}
                    {subtitleOffset.toFixed(1)}s
                  </span>
                </div>

                {/* Slider for fine adjustment */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.1"
                    value={Math.max(-5, Math.min(5, subtitleOffset))}
                    onChange={(e) =>
                      setSubtitleOffset(parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground px-1">
                    <span>-5s</span>
                    <span>+5s</span>
                  </div>
                </div>

                {/* Buttons for large adjustments */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSubtitleOffset((p) => p - 1)}
                    className="flex items-center justify-center gap-1"
                  >
                    <IconMinus className="w-4 h-4" />
                    1s
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setSubtitleOffset((p) => p + 1)}
                    className="flex items-center justify-center gap-1"
                  >
                    <IconPlus className="w-4 h-4" /> 1s
                  </Button>
                </div>

                {/* Reset Button */}
                {/* {subtitleOffset !== 0 && ( */}
                <Button
                  variant="secondary"
                  className="bg-red-500/30 hover:bg-red-500/40 w-full"
                  onClick={() => setSubtitleOffset(0)}
                >
                  <IconRefresh className="w-4 h-4" />
                  Reset
                </Button>
                {/* )} */}
              </div>
            ) : (
              <div className="flex p-2 justify-center items-center text-sm font-medium text-muted-foreground">
                No Subtitle Selected
              </div>
            ))}
          {/* Main Menu */}

          {!openQuality &&
            !openServer &&
            !openAudio &&
            !openSub &&
            !openTiming && (
              <motion.div
                key="main-menu"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.06, // 👈 1 by 1
                    },
                  },
                }}
                className="space-y-0.5"
              >
                {/* <motion.div
                  variants={{
                    hidden: { x: -20, opacity: 0 },
                    visible: { x: 0, opacity: 1 },
                  }}
                >
                  <MenuButton
                    label="Servers"
                    onClick={() => setOpenServer(true)}
                  />
                </motion.div> */}

                <motion.div
                  variants={{
                    hidden: { x: -20, opacity: 0 },
                    visible: { x: 0, opacity: 1 },
                  }}
                >
                  <MenuButton
                    label="Subtitle"
                    onClick={() => setOpenSub(true)}
                  />
                </motion.div>

                <motion.div
                  variants={{
                    hidden: { x: -20, opacity: 0 },
                    visible: { x: 0, opacity: 1 },
                  }}
                >
                  <MenuButton
                    label={`Timing ${
                      selectedSub &&
                      `(${data_sub.find((s) => s.file === selectedSub)?.label})`
                    }`}
                    onClick={() => setOpenTiming(true)}
                  />
                </motion.div>

                {quality.length > 0 && (
                  <motion.div
                    variants={{
                      hidden: { x: -20, opacity: 0 },
                      visible: { x: 0, opacity: 1 },
                    }}
                  >
                    <MenuButton
                      label="Quality"
                      onClick={() => setOpenQuality(true)}
                    />
                  </motion.div>
                )}

                {audioTracks.length > 0 && (
                  <motion.div
                    variants={{
                      hidden: { x: -20, opacity: 0 },
                      visible: { x: 0, opacity: 1 },
                    }}
                  >
                    <MenuButton
                      label="Audio Track"
                      onClick={() => setOpenAudio(true)}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
        </div>
      )}

      {open && (
        <div className="fixed inset-0 z-30 " onClick={handleButtonClick} />
      )}
    </div>
  );
}
/* ---------- Small Components ---------- */

export function MenuButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      size="lg"
      onClick={onClick}
      variant="ghost"
      className="w-full justify-between "
    >
      {label}
      <IconChevronRight />
    </Button>
  );
}

export function SubtitleButton({
  label,
  active,
  flag,
  onClick,
}: {
  label: string;
  active?: boolean;
  flag?: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-white/10"
    >
      <span className="flex items-center gap-2 capitalize line-clamp-1">
        {active && <IconCheck size={16} />}
        {label}
      </span>
      {flag && <img src={flag} alt="" />}
    </button>
  );
}
