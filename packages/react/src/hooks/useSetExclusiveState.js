import { useMemo } from 'react';
import {
  useUserStore,
  useMemberStore,
  useSearchMessageStore,
  useChannelStore,
  useThreadsMessageStore,
  useMentionsStore,
  usePinnedMessageStore,
  useStarredMessageStore,
  useFileStore,
} from '../store';

const useSetExclusiveState = () => {
  const setShowMembers = useMemberStore((state) => state.setShowMembers);
  const setShowSearch = useSearchMessageStore((state) => state.setShowSearch);
  const setShowPinned = usePinnedMessageStore((state) => state.setShowPinned);
  const setShowStarred = useStarredMessageStore(
    (state) => state.setShowStarred
  );
  const setShowAllThreads = useThreadsMessageStore(
    (state) => state.setShowAllThreads
  );
  const setShowAllFiles = useFileStore((state) => state.setShowAllFiles);
  const setShowMentions = useMentionsStore((state) => state.setShowMentions);
  const setShowCurrentUserInfo = useUserStore(
    (state) => state.setShowCurrentUserInfo
  );
  const setShowChannelinfo = useChannelStore(
    (state) => state.setShowChannelinfo
  );
  const stateSetters = useMemo(
    () => [
      setShowStarred,
      setShowPinned,
      setShowMembers,
      setShowSearch,
      setShowChannelinfo,
      setShowAllThreads,
      setShowAllFiles,
      setShowMentions,
      setShowCurrentUserInfo,
    ],
    [
      setShowAllFiles,
      setShowAllThreads,
      setShowChannelinfo,
      setShowCurrentUserInfo,
      setShowMembers,
      setShowMentions,
      setShowPinned,
      setShowSearch,
      setShowStarred,
    ]
  );

  const setExclusiveState = (activeSetter) => {
    stateSetters.forEach((setter) => {
      setter(setter === activeSetter);
    });
  };

  return setExclusiveState;
};

export default useSetExclusiveState;
