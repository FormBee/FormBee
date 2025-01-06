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
    @Column({nullable: false, default: false})
    telegramBoolean: boolean;

    @Column({nullable: true})
    telegramChatId: number | null;

    //Telegram settings end ____________________________________________________________________

    //Discord settings start _________________________________________________________________
    @Column({nullable: false, default: false})
    discordBoolean: boolean;

    @Column({nullable: true})
    discordWebhook: string | null;

    //Discord settings end ____________________________________________________________________

    //Slack settings start _________________________________________________________________

    @Column({nullable: false, default: false})
    slackBoolean: boolean;

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

    @Column({nullable: false, default: false})
    makeBoolean: boolean;
    //Make settings end ____________________________________________________________________

    //n8n settings start ___________________________________________________________________

    @Column({nullable: true})
    n8nWebhook: string | null;

    @Column({nullable: false, default: false})
    n8nBoolean: boolean;
    //n8n settings end ____________________________________________________________________

    // Misc Webhook settings start _____________________________________________________________

    @Column({nullable: true})
    webhookWebhook: string | null;

    @Column({nullable: false, default: false})
    webhookBoolean: boolean;
    // Misc Webhook settings end _________________________________________________________________

@Column('text', {
    nullable: true,
    default: '',
    transformer: {
        to: (value: string[]): string => {
            const uniqueValues = Array.from(new Set(value));
            return uniqueValues.join(',');
        },
        from: (value: string): string[] => {
            const uniqueValues = value ? Array.from(new Set(value.split(','))) : [];
            return uniqueValues;
        },
    }
    })
    allowedDomains: string[];


    @Column({nullable: true, default: 1})
    maxPlugins: number;

    @Column({nullable: true, default: 0})
    currentPlugins: number;
    //stripe data 
    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    stripeCustomerId: string | null;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    stripePaymentIntentId: string | null;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    stripeSubscriptionId: string | null;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    billingEmail: string | null;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    stripeDefaultPaymentMethodId: string | null;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    setupIntentId: string | null;

    @Column({nullable: true})
    subscriptionId: string | null;

    @Column({nullable: true})
    nextMonthTier: string | null;
}