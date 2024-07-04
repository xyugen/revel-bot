import { AttachmentBuilder, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { pdf } from "pdf-to-img";

export default {
    data: new SlashCommandBuilder()
        .setName('pdftoimg')
        .setDescription('Convert a PDF to an image')
        .addAttachmentOption(option => option
            .setName("pdf")
            .setDescription("The PDF to convert")
            .setRequired(true)
        ),
    permissions: [],
    cooldown: 3,
    async execute(interaction: ChatInputCommandInteraction, input: string) {
        try {
            await interaction.deferReply();
            const attachment = interaction.options.getAttachment("pdf", true);

            const arrayBuffer = await fetch(attachment.url).then(res => res.arrayBuffer());
            const buffer = Buffer.from(arrayBuffer);
            const document = await pdf(buffer, { scale: 3 });

            const attachments: AttachmentBuilder[] = [];
            let counter = 1;

            for await (const page of document) {
                const attachment = new AttachmentBuilder(page, { name: `page${counter}.jpg` });
                attachments.push(attachment);

                counter++;
            }

            await interaction.editReply({ content: `✅ Converted ${counter - 1} pages to images.`, files: attachments });
        } catch (error) {
            console.error(`Error converting PDF to images: ${error}`);
            await interaction.reply({
                content: '❌ An error occurred while converting the PDF to images.',
                ephemeral: true
            });
        }
    }
}