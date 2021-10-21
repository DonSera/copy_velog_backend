import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne} from "typeorm";
import {User} from "./User";

@Entity('post')
export class Post extends BaseEntity {

    @PrimaryGeneratedColumn({type: "int"})
    id: number;

    @Column({type: "varchar", nullable: false})
    date: string;

    @Column({type: "int", nullable: false})
    writerId: number;

    @ManyToOne(() => User, user => user.posts)
    writer: User;

    @Column({type: "varchar", nullable: false})
    title: string;

    @Column({type: "varchar", nullable: true})
    subTitle: string;

    @Column({type: "longtext", nullable: true})
    content: string;
}