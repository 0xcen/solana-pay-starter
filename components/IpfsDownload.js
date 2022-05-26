import React from 'react';
import useIPFS from '../hooks/useIPFS';

const IPFSDownload = ({ hash, filename, cta }) => {
	const file = useIPFS(hash, filename);
	console.log(
		'🚀 ~ file: IPFSDownload.js ~ line 6 ~ IPFSDownload ~ file',
		file
	);

	return (
		<div>
			{/* This conditional works becuase you'll display the component itself conditionally too. 
      So as long as the component is visible it should behave in this manner. */}
			{file ? (
				<div className="download-component">
					<a className="download-button" href={file} download={filename}>
						{cta}
					</a>
				</div>
			) : (
				<p>Downloading file...</p>
			)}
		</div>
	);
};

export default IPFSDownload;
