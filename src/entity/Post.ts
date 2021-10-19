import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne} from "typeorm";
import {User} from "./User";

@Entity('post')
export class Post extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable: false})
    date: string;

    @Column({nullable: false})
    writerId : number;

    @ManyToOne(() => User, user => user.posts)
    writer: User;

    @Column({nullable: false})
    title: string;

    @Column({nullable: true})
    subTitle: string;

    @Column({nullable: true})
    content: string;
}