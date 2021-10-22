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

    @Column({type: "varchar", nullable: true, unique: true})
    name: string;

    @Column({type: "varchar", default: "https://i.ibb.co/ypzwkK8/2021-10-22-11-41-58.png"})
    img: string;

    @OneToMany(() => Post, post => post.writerId)
    posts: Post[];

}