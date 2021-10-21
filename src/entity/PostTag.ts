import {BaseEntity, Entity, OneToOne, PrimaryColumn} from "typeorm";
import {Post} from "./Post";
import {Tag} from "./Tag";

@Entity('postTag')
export class PostTag extends BaseEntity{
    @PrimaryColumn({type:"int"})
    postId : number;

    @PrimaryColumn({type: "varchar"})
    tagTag: string;

    @OneToOne(() => Post, post => post.id)
    post : Post

    @OneToOne(() =>Tag, tag =>tag.tag)
    tag: Tag;
}