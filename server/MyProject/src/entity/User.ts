import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { encrypt, decrypt } from "../miscUtils/encryption"


@Entity()
export class User {

    //Basic user info start ___________________________________________________________________
    @PrimaryGeneratedColumn()
    id: number

    @Column({ unique: true, nullable: true })
    githubId: number | null

    @Column({nullable: true})
    name: string | null

    @Column({nullable: true})
    apiKey: string | null

    @Column({nullable: false, default: 250})
    maxSubmissions: number;

    @Column({nullable: false, default: 0})
    currentSubmissions: number;

    @Column({nullable: false, default: 50})
    localHostMaxSubmissions: number;

    @Column({nullable: false, default: 0})
    localHostCurrentSubmissions: number;

    @Column({nullable: false, default: "Starter"})
    subscriptionTier: string;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    email: string | null;

    @Column({nullable: true})
    apiResetDate: Date | null;
    //Basic user info end _____________________________________________________________________

    //Return email settings start _____________________________________________________________
    @Column({nullable: true, default: false})
    returnBoolean: boolean | null;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    fromEmailAccessToken: string | null;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    fromEmail: string | null;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    fromEmailRefreshToken: string | null;

    @Column({nullable: true})
    smtpHost: string | null;

    @Column({nullable: true})
    smtpPort: number | null;

    @Column({nullable: true})
    smtpUsername: string | null;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    smtpPassword: string | null;

    @Column({nullable: true})
    emailSubject: string | null;

    @Column({nullable: true})
    emailBody: string | null;
    //Return email settings end _________________________________________________________________


    //Telegram settings start _________________________________________________________________
    @Column({nullable: true, default: false})
    telegramBoolean: boolean | null;

    @Column({nullable: true})
    telegramChatId: number | null;

    //Telegram settings end ____________________________________________________________________

    //Discord settings start _________________________________________________________________
    @Column({nullable: true, default: false})
    discordBoolean: boolean | null;

    @Column({nullable: true})
    discordWebhook: string | null;

    //Discord settings end ____________________________________________________________________

    //Slack settings start _________________________________________________________________

    @Column({nullable: true, default: false})
    slackBoolean: boolean | null;

    @Column({nullable: true})
    slackChannelId: string | null;

    @Column({nullable: true})
    slackAccessToken: string | null;

    @Column({nullable: true})
    slackChannelName: string | null;

    //Slack settings end ____________________________________________________________________

    //Make settings start ___________________________________________________________________

    @Column({nullable: true})
    makeWebhook: string | null;

    @Column({nullable: true})
    makeBoolean: boolean | null;
    //Make settings end ____________________________________________________________________

    //n8n settings start ___________________________________________________________________

    @Column({nullable: true})
    n8nWebhook: string | null;

    @Column({nullable: true})
    n8nBoolean: boolean | null;
    //n8n settings end ____________________________________________________________________
}
    
