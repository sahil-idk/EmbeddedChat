import React from 'react';
import PropTypes from 'prop-types';
import { css } from '@emotion/react';
import ImageAttachment from './ImageAttachment';
import AudioAttachment from './AudioAttachment';
import VideoAttachment from './VideoAttachment';
import { Box } from '../../components/Box';
import { Icon } from '../../components/Icon';
import TextAttachment from './TextAttachment';

const Attachment = ({ attachment, host, type, variantStyles = {} }) => {
  if (attachment && attachment.audio_url) {
    return (
      <AudioAttachment
        attachment={attachment}
        host={host}
        variantStyles={variantStyles}
      />
    );
  }
  if (attachment && attachment.video_url) {
    return (
      <VideoAttachment
        attachment={attachment}
        host={host}
        variantStyles={variantStyles}
      />
    );
  }
  if (attachment && attachment.image_url) {
    return (
      <ImageAttachment
        attachment={attachment}
        host={host}
        variantStyles={variantStyles}
      />
    );
  }
  if (attachment && attachment.text) {
    return (
      <TextAttachment
        attachment={attachment}
        type={type}
        variantStyles={variantStyles}
      />
    );
  }
  return (
    <Box
      css={css`
        display: flex;
      `}
    >
      {attachment?.description}

      <Icon name="file" size="20px" />
      <a href={`${host}${attachment.title_link}`}>{attachment.title}</a>
    </Box>
  );
};

export default Attachment;

Attachment.propTypes = {
  attachment: PropTypes.object,
  host: PropTypes.string,
};
