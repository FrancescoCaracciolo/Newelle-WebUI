<template>
  <div class="streaming-indicator">
    <span class="dot"></span>
    <span class="dot"></span>
    <span class="dot"></span>
  </div>
</template>

<style scoped>
.streaming-indicator {
  display: inline-flex;
  gap: 3px;
  align-items: center;
}

.dot {
  width: 5px;
  height: 5px;
  background: var(--accent);
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% {
    opacity: 0.3;
    transform: scale(0.8);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
