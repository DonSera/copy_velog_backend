import {Entity, BaseEntity, PrimaryColumn} from "typeorm";

@Entity('tag')
export class Tag extends BaseEntity {
    @PrimaryColumn({type: "varchar"})
    tag: string;
}