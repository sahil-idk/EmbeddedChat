/* eslint-disable no-shadow */
import React, { useCallback, useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import RCContext from '../../context/RCInstance';
import { useMessageStore, useUserStore, useChannelStore } from '../../store';
import MessageList from '../MessageList';
import TotpModal from '../TotpModal/TwoFactorTotpModal';
import { Box } from '../../components/Box';
import { useRCAuth } from '../../hooks/useRCAuth';
import LoginForm from '../LoginForm/LoginForm';
import ThreadMessageList from '../Thread/ThreadMessageList';
import useComponentOverrides from '../../hooks/useComponentOverrides';
import RecentMessageButton from './RecentMessageButton';
import useFetchChatData from '../../hooks/useFetchChatData';
import { useChatbodyStyles } from './ChatBody.styles';
import UiKitModal from '../ModalBlock/uiKit/UiKitModal';
import useUiKitStore from '../../store/uiKitStore';
import useUiKitActionManager from '../../hooks/uiKit/useUiKitActionManager';

const ChatBody = ({
  anonymousMode,
  showRoles,
  messageListRef,
  scrollToBottom,
}) => {
  const { classNames, styleOverrides } = useComponentOverrides('ChatBody');

  const styles = useChatbodyStyles();
  const [scrollPosition, setScrollPosition] = useState(0);
  const [popupVisible, setPopupVisible] = useState(false);
  const [, setIsUserScrolledUp] = useState(false);
  const [otherUserMessage, setOtherUserMessage] = useState(false);

  const { RCInstance, ECOptions } = useContext(RCContext);
  const messages = useMessageStore((state) => state.messages);
  const threadMessages = useMessageStore((state) => state.threadMessages);

  const setThreadMessages = useMessageStore((state) => state.setThreadMessages);
  const upsertMessage = useMessageStore((state) => state.upsertMessage);
  const removeMessage = useMessageStore((state) => state.removeMessage);
  const isChannelPrivate = useChannelStore((state) => state.isChannelPrivate);

  const [isThreadOpen, threadMainMessage] = useMessageStore((state) => [
    state.isThreadOpen,
    state.threadMainMessage,
  ]);

  const { uiKitModalOpen, uiKitModalData } = useUiKitStore((state) => ({
    uiKitModalOpen: state.uiKitModalOpen,
    uiKitModalData: state.uiKitModalData,
  }));

  const { handleLogin } = useRCAuth();
  const { handleServerInteraction } = useUiKitActionManager();

  const isUserAuthenticated = useUserStore(
    (state) => state.isUserAuthenticated
  );

  const username = useUserStore((state) => state.username);

  const getMessagesAndRoles = useFetchChatData(showRoles);

  const getThreadMessages = useCallback(async () => {
    if (isUserAuthenticated && threadMainMessage?._id) {
      try {
        if (!isUserAuthenticated && !anonymousMode) {
          return;
        }
        const { messages } = await RCInstance.getThreadMessages(
          threadMainMessage._id,
          isChannelPrivate
        );
        setThreadMessages(messages);
      } catch (e) {
        console.error(e);
      }
    }
  }, [
    isUserAuthenticated,
    anonymousMode,
    RCInstance,
    threadMainMessage?._id,
    setThreadMessages,
    isChannelPrivate,
  ]);

  useEffect(() => {
    if (isThreadOpen && ECOptions.enableThreads) {
      getThreadMessages();
    }
  }, [getThreadMessages, isThreadOpen, ECOptions?.enableThreads]);

  const addMessage = useCallback(
    (message) => {
      if (message.u.username !== username) {
        const isScrolledUp = messageListRef?.current?.scrollTop !== 0;
        if (isScrolledUp && !('pinned' in message) && !('starred' in message)) {
          setOtherUserMessage(true);
        }
      }
      upsertMessage(message, ECOptions?.enableThreads);
    },
    [upsertMessage, ECOptions?.enableThreads, username, messageListRef]
  );

  const onActionTriggerResponse = useCallback(
    (data) => {
      handleServerInteraction(data);
    },
    [handleServerInteraction]
  );

  useEffect(() => {
    RCInstance.auth.onAuthChange((user) => {
      if (user) {
        RCInstance.addMessageListener(addMessage);
        RCInstance.addMessageDeleteListener(removeMessage);
        RCInstance.addActionTriggeredListener(onActionTriggerResponse);
        RCInstance.addUiInteractionListener(onActionTriggerResponse);
        getMessagesAndRoles();
      } else {
        getMessagesAndRoles(anonymousMode);
      }
    });

    return () => {
      RCInstance.close();
      RCInstance.removeMessageListener(addMessage);
      RCInstance.removeMessageDeleteListener(removeMessage);
      RCInstance.removeActionTriggeredListener(onActionTriggerResponse);
      RCInstance.removeUiInteractionListener(onActionTriggerResponse);
    };
  }, [
    RCInstance,
    getMessagesAndRoles,
    addMessage,
    removeMessage,
    onActionTriggerResponse,
    anonymousMode,
  ]);

  const handlePopupClick = () => {
    scrollToBottom();
    setIsUserScrolledUp(false);
    setOtherUserMessage(false);
    setPopupVisible(false);
  };

  const handleScroll = () => {
    if (messageListRef && messageListRef.current) {
      setScrollPosition(messageListRef.current.scrollTop);
      setIsUserScrolledUp(
        messageListRef.current.scrollTop + messageListRef.current.clientHeight <
          messageListRef.current.scrollHeight
      );
    }

    const isAtBottom = messageListRef?.current?.scrollTop === 0;
    if (isAtBottom) {
      setPopupVisible(false);
      setIsUserScrolledUp(false);
      setOtherUserMessage(false);
    }
  };

  const showNewMessagesPopup = () => {
    setPopupVisible(true);
  };

  useEffect(() => {
    const currentRef = messageListRef.current;
    currentRef.addEventListener('scroll', handleScroll);

    return () => {
      currentRef.removeEventListener('scroll', handleScroll);
    };
  }, [messageListRef]);

  useEffect(() => {
    const isScrolledUp =
      scrollPosition + messageListRef.current.clientHeight <
      messageListRef.current.scrollHeight;

    if (isScrolledUp && otherUserMessage) {
      showNewMessagesPopup();
    }
  }, [scrollPosition, otherUserMessage]);

  return (
    <>
      <Box
        ref={messageListRef}
        css={styles.chatbodyContainer}
        style={{
          ...styleOverrides,
        }}
        className={`ec-chat-body ${classNames}`}
      >
        {isThreadOpen ? (
          <ThreadMessageList
            threadMainMessage={threadMainMessage}
            threadMessages={threadMessages}
          />
        ) : (
          <MessageList messages={messages} />
        )}
        <TotpModal handleLogin={handleLogin} />
        <LoginForm />
        {uiKitModalOpen && (
          <UiKitModal key={Math.random()} initialView={uiKitModalData} />
        )}
      </Box>
      {popupVisible && otherUserMessage && (
        <RecentMessageButton
          visible
          text="New messages"
          onClick={handlePopupClick}
        />
      )}
    </>
  );
};

export default ChatBody;

ChatBody.propTypes = {
  anonymousMode: PropTypes.bool,
  showRoles: PropTypes.bool,
};
