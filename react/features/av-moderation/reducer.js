/* @flow */

import { MEDIA_TYPE } from '../base/media/constants';
import {
    PARTICIPANT_LEFT,
    PARTICIPANT_UPDATED
} from '../base/participants';
import { ReducerRegistry } from '../base/redux';

import {
    DISABLE_MODERATION,
    DISMISS_PENDING_PARTICIPANT,
    ENABLE_MODERATION,
    LOCAL_PARTICIPANT_APPROVED,
    PARTICIPANT_APPROVED,
    PARTICIPANT_PENDING_AUDIO
} from './actionTypes';

const initialState = {
    audioModerationEnabled: false,
    videoModerationEnabled: false,
    audioWhitelist: {},
    videoWhitelist: {},
    pendingAudio: [],
    pendingVideo: []
};

ReducerRegistry.register('features/av-moderation', (state = initialState, action) => {

    switch (action.type) {
    case DISABLE_MODERATION: {
        const newState = action.mediaType === MEDIA_TYPE.AUDIO
            ? {
                audioModerationEnabled: false,
                audioUnmuteApproved: undefined
            } : {
                videoModerationEnabled: false,
                videoUnmuteApproved: undefined
            };

        return {
            ...state,
            ...newState,
            audioWhitelist: {},
            videoWhitelist: {},
            pendingAudio: [],
            pendingVideo: []
        };
    }

    case ENABLE_MODERATION: {
        const newState = action.mediaType === MEDIA_TYPE.AUDIO
            ? { audioModerationEnabled: true } : { videoModerationEnabled: true };

        return {
            ...state,
            ...newState
        };
    }

    case LOCAL_PARTICIPANT_APPROVED: {
        const newState = action.mediaType === MEDIA_TYPE.AUDIO
            ? { audioUnmuteApproved: true } : { videoUnmuteApproved: true };

        return {
            ...state,
            ...newState
        };
    }

    case PARTICIPANT_PENDING_AUDIO: {
        const { participant } = action;

        // Add participant to pendingAudio array only if it's not already added
        if (!state.pendingAudio.find(pending => pending.id === participant.id)) {
            const updated = [ ...state.pendingAudio ];

            updated.push(participant);

            return {
                ...state,
                pendingAudio: updated
            };
        }

        return state;
    }

    case PARTICIPANT_UPDATED:
    case PARTICIPANT_LEFT: {
        const participant = action.participant;

        // skips changing the reference of pendingAudio or pendingVideo,
        // if there is no change in the elements
        const newPendingAudio = state.pendingAudio.filter(pending => pending.id !== participant.id);

        if (state.pendingAudio.length !== newPendingAudio) {
            state.pendingAudio = action.type === PARTICIPANT_UPDATED
                ? [ ...newPendingAudio, participant ]
                : newPendingAudio;
        }

        const newPendingVideo = state.pendingVideo.filter(pending => pending.id !== participant.id);

        if (state.pendingVideo.length !== newPendingVideo) {
            state.pendingVideo = action.type === PARTICIPANT_UPDATED
                ? [ ...newPendingVideo, participant ]
                : newPendingVideo;
        }

        return state;
    }

    case DISMISS_PENDING_PARTICIPANT: {
        const { participant, mediaType } = action;

        if (mediaType === MEDIA_TYPE.AUDIO) {
            return {
                ...state,
                pendingAudio: state.pendingAudio.filter(pending => pending.id !== participant.id)
            };
        }

        if (mediaType === MEDIA_TYPE.VIDEO) {
            return {
                ...state,
                pendingVideo: state.pendingVideo.filter(pending => pending.id !== participant.id)
            };
        }

        return state;
    }

    case PARTICIPANT_APPROVED: {
        const { mediaType, id } = action;

        if (mediaType === MEDIA_TYPE.AUDIO) {
            return {
                ...state,
                audioWhitelist: {
                    ...state.audioWhitelist,
                    [id]: true
                }
            };
        }

        if (mediaType === MEDIA_TYPE.VIDEO) {
            return {
                ...state,
                videoWhitelist: {
                    ...state.videoWhitelist,
                    [id]: true
                }
            };
        }

        return state;
    }

    }

    return state;
});
