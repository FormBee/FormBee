import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

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
}

    
