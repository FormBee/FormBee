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

    @Column({nullable: true})
    maxSubmissions: number | null

    @Column({nullable: true})
    currentSubmissions: number | null
}

    
