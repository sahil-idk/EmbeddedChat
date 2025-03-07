import React from 'react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';
import { useUserStore } from '../../store';
import { Icon } from '../../components/Icon';
import useComponentOverrides from '../../hooks/useComponentOverrides';
import { Box } from '../../components/Box';
import { appendClassNames } from '../../lib/appendClassNames';
import { filePreviewHeaderStyles as styles } from './Files.styles';

const FilePreviewHeader = ({ file, isTimeStamped = true }) => {
  const { styleOverrides, classNames } = useComponentOverrides('MessageHeader');
  const authenticatedUserId = useUserStore((state) => state.userId);
  const isStarred =
    file?.starred && file?.starred?.find((u) => u._id === authenticatedUserId);

  return (
    <Box
      css={styles.previewHeader}
      className={appendClassNames('ec-file-header', classNames)}
      style={styleOverrides}
    >
      <Box
        is="span"
        css={styles.previewHeaderName}
        className={appendClassNames('ec-file-header-name')}
      >
        {file?.name}
      </Box>

      {isTimeStamped && (
        <Box
          is="span"
          css={styles.previewHeaderTimestap}
          className={appendClassNames('ec-file-header-timestamp')}
        >
          {format(new Date(file?.ts), 'h:mm a')}
        </Box>
      )}
      {isStarred ? (
        <Icon
          style={{ marginInlineEnd: '0.4rem', opacity: 0.5 }}
          name="star-filled"
          size="1em"
        />
      ) : null}
    </Box>
  );
};

export default FilePreviewHeader;

FilePreviewHeader.propTypes = {
  file: PropTypes.any,
};
