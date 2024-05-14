import {useCallback, useEffect, useState} from 'react';
import {
	AbsoluteFill,
	Audio,
	CalculateMetadataFunction,
	cancelRender,
	continueRender,
	delayRender,
	getStaticFiles,
	interpolate,
	OffthreadVideo,
	Sequence,
	staticFile,
	useVideoConfig,
	watchStaticFile,
} from 'remotion';
import {z} from 'zod';
import Subtitle from './Subtitle';
import {getVideoMetadata} from '@remotion/media-utils';
import {loadFont} from '../load-font';
import {NoCaptionFile} from './NoCaptionFile';

export type SubtitleProp = {
	startInSeconds: number;
	text: string;
};

export const captionedVideoSchema = z.object({
	src: z.string(),
});

export const calculateCaptionedVideoMetadata: CalculateMetadataFunction<
	z.infer<typeof captionedVideoSchema>
> = async ({props}) => {
	const fps = 30;
	const metadata = await getVideoMetadata(props.src);

	return {
		fps,
		durationInFrames: Math.floor(metadata.durationInSeconds * fps),
	};
};

const getFileExists = (file: string) => {
	const files = getStaticFiles();
	const fileExists = files.find((f) => {
		return f.src === file;
	});
	return Boolean(fileExists);
};

export const CaptionedVideo: React.FC<{
	src: string;
}> = ({src}) => {
	const [subtitles, setSubtitles] = useState<SubtitleProp[]>([]);
	const [handle] = useState(() => delayRender());
	const {fps} = useVideoConfig();

	const subtitlesFile = src
		.replace(/.mp4$/, '.json')
		.replace(/.mkv$/, '.json')
		.replace(/.mov$/, '.json')
		.replace(/.webm$/, '.json');

	const fetchSubtitles = useCallback(async () => {
		try {
			await loadFont();
			const res = await fetch(subtitlesFile);
			const data = await res.json();
			setSubtitles(data.transcription);
			continueRender(handle);
		} catch (e) {
			cancelRender(e);
		}
	}, [handle, subtitlesFile]);

	useEffect(() => {
		fetchSubtitles();

		const c = watchStaticFile(subtitlesFile, () => {
			fetchSubtitles();
		});

		return () => {
			c.cancel();
		};
	}, [fetchSubtitles, src, subtitlesFile]);

	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			{/* <AbsoluteFill> */}
				<Sequence from={0} durationInFrames={60}>
				<OffthreadVideo
					style={{
						objectFit: 'cover',
						objectPosition: 'center',
					}}
					src={src}
					/>
					</Sequence>
				<Sequence from={60} durationInFrames={120}>
				<OffthreadVideo
					style={{
						objectFit: 'contain',
						objectPosition: 'center',
					}}
					src={src}
					/>
					</Sequence>

			{/* </AbsoluteFill> */}
			{subtitles.map((subtitle, index) => {
				const nextSubtitle = subtitles[index + 1] ?? null;
				const subtitleStartFrame = subtitle.startInSeconds * fps;
				const subtitleEndFrame = Math.min(
					nextSubtitle ? nextSubtitle.startInSeconds * fps : Infinity,
					subtitleStartFrame + fps,
				);
				const durationInFrames = subtitleEndFrame - subtitleStartFrame;
				if (durationInFrames <= 0) {
					return null;
				}

				return (
					<Sequence
						from={subtitleStartFrame}
						durationInFrames={durationInFrames}
					>
						<Subtitle key={index} text={subtitle.text} />;
					</Sequence>
				);
			})}
			{getFileExists(subtitlesFile) ? null : <NoCaptionFile />}
			<AbsoluteFill>
      {/* <Audio volume={0.5} src={staticFile("background.mp3")} /> */}
      <Audio
        volume={(f) =>
          interpolate(f, [0, 300], [0, 0.4], { extrapolateLeft: "clamp" })
        }
        src={staticFile("audio.mp3")}
      />
    </AbsoluteFill>
		</AbsoluteFill>
	);
};
