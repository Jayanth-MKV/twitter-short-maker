import {Composition, staticFile} from 'remotion';
import {
	CaptionedVideo,
	calculateCaptionedVideoMetadata,
	captionedVideoSchema,
} from './CaptionedVideo';
import { useCallback, useState } from 'react';

// Each <Composition> is an entry in the sidebar!

type VideoState =
  | {
      type: "empty";
    }
  | {
      type: "blob" | "cloud";
      url: string;
    };

export const RemotionRoot: React.FC = () => {

	const [videoState, setVideoState] = useState<VideoState>({
    type: "empty",
  });
 
  const handleChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files === null) {
        return;
      }
 
      const file = event.target.files[0];
      const blobUrl = URL.createObjectURL(file);
      setVideoState({ type: "blob", url: blobUrl });
      // const cloudUrl = await upload(file);
      // setVideoState({ type: "cloud", url: cloudUrl });
      // URL.revokeObjectURL(blobUrl);
    },
    []
  );

	return (
		<>
		
		      {videoState.type !== "empty" ? (
		<Composition
			id="CaptionedVideo"
			component={CaptionedVideo}
			calculateMetadata={calculateCaptionedVideoMetadata}
			schema={captionedVideoSchema}
			width={1080}
			height={1920}
			defaultProps={{
				src:  videoState?.url || staticFile('sample-video.mp4'),
			}}
			
			/>)
			: null}
		      {videoState.type !== "empty" ? (
		<Composition
			id="CaptionedVideo1"
			component={CaptionedVideo}
			calculateMetadata={calculateCaptionedVideoMetadata}
			schema={captionedVideoSchema}
			width={1080}
			height={1920}
			defaultProps={{
				src:  videoState?.url || staticFile('sample-video.mp4'),
			}}
			
			/>)
			: null}
      <input type="file" onChange={handleChange} />
			</>
	);
};
