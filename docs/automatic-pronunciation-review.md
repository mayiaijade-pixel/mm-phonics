# Automatic practice feedback

All units use Say it → speak → about one second of silence → automatic review → Good job! / Try again! feedback. Manual Stop also submits automatically. Review is no longer a separate learner step. Existing pronunciation thresholds and feedback tips remain unchanged.

The same microphone stream feeds MediaRecorder and a disconnected Web Audio analyser. Nothing is connected to the speakers. Initial silence alone does not end recording; a short noise click does not qualify as speech. Recording stops at 15 seconds maximum. Browsers without a working analyser retain manual Stop and the time limit.

The UI shows Listening… while the existing pronunciation API processes the recording. This is automatic assessment after the utterance, not a streaming phoneme judge. Permission errors, interrupted recordings, and network errors show retry guidance rather than falsely awarding success or an incorrect pronunciation result. Navigation, stale recording callbacks and stale assessment responses cannot submit or show feedback for a different card.

Verify: `node scripts/test-auto-pronunciation.mjs` covers silence/speech endpoint behavior and actual component recording callbacks with mocked MediaRecorder, permissions and API. It tests success, retry, manual stop, navigation cancellation, delayed permission, recorder errors and aborted responses. Run pronunciation and guidance regression tests plus TypeScript and both production builds. Real microphone behavior still requires phone testing.
