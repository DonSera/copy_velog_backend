import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany} from "typeorm";
import {Post} from "./Post";

@Entity('user')
export class User extends BaseEntity {

    @PrimaryGeneratedColumn({type: "int",})
    id: number;

    @Column({type: "varchar", unique: true, nullable: false})
    email: string;

    @Column({type: "varchar", nullable: false})
    password: string;

    @Column({type: "varchar", nullable: true})
    name: string;

    @OneToMany(() => Post, post => post.writerId)
    posts: Post[];

}