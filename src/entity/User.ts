import {Entity, PrimaryGeneratedColumn, Column, BaseEntity} from "typeorm";

@Entity('user')
export class User extends BaseEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true, nullable:false})
    email: string;

    @Column({nullable: false})
    password: string;

    @Column({nullable: true})
    name: string;

}