<template>
  <div
    class="context"
    @contextmenu.prevent
    :style="clampPos"
    v-click-outside="clickOutside"
  >
    <div class="content">
      <EmojiPicker @click="emojiPicked" class="emoji-picker" />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from "vue-property-decorator";
import EmojiPicker from "@/components/emoji-picker/EmojiPicker.vue";
import windowProperties from "@/utils/windowProperties";
import { PopoutsModule } from "@/store/modules/popouts";
import { addReaction } from "@/services/messagesService";
import { MessagesModule } from "@/store/modules/messages";
import { Reaction } from "@/interfaces/Message";
interface Prop {
  messageID: string;
  channelID: string;
  x: number;
  y: number;
}
@Component({ components: { EmojiPicker } })
export default class extends Vue {
  @Prop() private data!: Prop;
  @Prop() private identity!: string;
  clickOutside(event: any) {
    if (event.target.closest(".context")) return;
    PopoutsModule.ClosePopout(this.identity);
  }

  emojiPicked(event: { unicode: string; gif: boolean; emojiID: string }) {
    PopoutsModule.ClosePopout(this.identity);

    let oldReaction: Reaction | undefined = MessagesModule.messageReaction({
      messageID: this.data.messageID,
      channelID: this.data.channelID,
      emojiID: event.emojiID,
      unicode: event.unicode
    });
    if (oldReaction && oldReaction.reacted) return;
    if (!oldReaction) {
      oldReaction = {
        count: 0,
        emojiID: event.emojiID,
        unicode: event.unicode,
        gif: event.gif,
        reacted: false
      };
    }

    MessagesModule.UpdateMessageReaction({
      channelID: this.data.channelID,
      messageID: this.data.messageID,
      reaction: { ...oldReaction, count: oldReaction.count + 1 },
      removeIfZero: false
    });

    addReaction(this.data.channelID, this.data.messageID, {
      emojiID: event.emojiID,
      gif: event.gif,
      unicode: event.unicode
    });
  }
  clamp(num: number, min: number, max: number) {
    return num <= min ? min : num >= max ? max : num;
  }

  get clampPos() {
    const top = this.data.y || 0;
    const left = this.data.x || 0;

    // prevent from going bottom of the screen
    const heightPos = 354 + top;
    const clampedTop =
      this.clamp(heightPos, 0, this.windowDiamentions.height) - 354;
    // prevent from going right of the screen
    const widthPos = 377 + left;
    const clampedLeft =
      this.clamp(widthPos, 0, this.windowDiamentions.width) - 377;

    return {
      top: clampedTop + "px",
      left: clampedLeft + "px"
    };
  }
  get windowDiamentions() {
    return {
      height: windowProperties.resizeHeight,
      width: windowProperties.resizeWidth
    };
  }
}
</script>

<style scoped></style>

<style lang="scss" scoped>
.context {
  pointer-events: all;
  background: var(--context-menu-bg-color);
  box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
  position: absolute;
  border-radius: 4px;
  overflow: hidden;
  z-index: 99999999999;
}
.content {
  display: flex;
  flex-direction: column;
  opacity: 0;
  animation: showUp 0.2s;
  animation-fill-mode: forwards;
}
.emoji-picker {
  position: relative;
  bottom: initial;
  right: initial;
}
@keyframes showUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>