import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { encrypt, decrypt } from "../miscUtils/encryption"


@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    //can be null
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

    @Column({nullable: true, default: false})
    returnBoolean: boolean | null;

    @Column({nullable: true})
    returnMessage: string | null;

    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    fromEmailPassword: string | null;
    @Column({nullable: true, transformer: {
        to: (value: string | null) => encrypt(value),
        from: (value: string | null) => decrypt(value),
    }})
    emailToReturnFrom: string | null;
}
    
