import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MemberMessageStatus } from '../../../../../../core/models/conversations/member-message-status';
import { MessageFromMemberModel } from '../../../../../../core/models/conversations/message-from-member-model';
import { MessageType } from '../../../../../../core/models/conversations/message-type';
import { SendMessageRequest } from '../../../../../../core/models/conversations/send-message-request';
import { SendMessageResult } from '../../../../../../core/models/conversations/send-message-result';
import { ComponentLoadingService } from '../../../../../../shared/services/component-loading.service';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { ChatFacade } from '../../../../facades/chat.facade';

@Component({
    selector: 'app-send-message',
    imports: [MatButtonModule],
    providers: [ComponentLoadingService],
    templateUrl: './send-message.component.html',
    styleUrl: './send-message.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SendMessageComponent {
    public readonly conversationId = input.required<string>();

    public readonly messageSent = output<MessageFromMemberModel>();

    constructor(
        private readonly chatFacade: ChatFacade,
        private readonly notificationService: NotificationService,
        public readonly loadingService: ComponentLoadingService) { }

    public async sendMessage(messageInput: HTMLTextAreaElement): Promise<void> {
        const body = messageInput.value.trim();

        if (!body || this.loadingService.isLoading())
            return;

        await this.loadingService.trackAsync(async () => {
            const request: SendMessageRequest = { type: MessageType.Normal, body };
            const result = await this.chatFacade.sendMessage(this.conversationId(), request);

            if (!result.success) {
                this.notificationService.error('Não foi possível enviar a mensagem. Tente novamente.');
                return;
            }

            messageInput.value = '';
            this.notificationService.success('Mensagem enviada com sucesso.');
            this.messageSent.emit(this.createNewMessage(result, body));
        });
    }

    public onKeyDown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage(event.target as HTMLTextAreaElement);
        }
    }

    private createNewMessage(result: { success: true; data: SendMessageResult; }, body: string): MessageFromMemberModel {
        const currentDate = new Date().toISOString();

        return {
            messageId: result.data.messageId,
            conversationId: result.data.conversationId,
            memberId: '',
            senderMemberId: '',
            senderDisplayName: 'Você',
            destinationMemberId: '',
            destinationDisplayName: '',
            sendDate: currentDate,
            deliveryDate: currentDate,
            type: MessageType.Normal,
            status: MemberMessageStatus.Read,
            content: body,
            isMessageFromMember: true
        };
    }
}