import { Entity } from "./Entity";
import Ajax from "../util/Ajax";
import Organization from "./Organization";
import MergeRequest from "./MergeRequest";

export default class User extends Entity {
    id: string;
    email: string;
    atlassianId: string;
    organizationId: string;
    organization: Organization;
    authProviderId: string;
    requirePassword: boolean;
    admin: boolean;
    superAdmin: boolean;
    password: string;

    constructor() {
        super();
        this.id = "";
        this.email = "";
        this.atlassianId = "";
        this.organizationId = "";
        this.organization = new Organization();
        this.authProviderId = "";
        this.requirePassword = false;
        this.admin = false;
        this.superAdmin = false;
        this.password = "";
    }

    serialize(): Object {
        return Object.assign(super.serialize(), {
            "email": this.email,
            "admin": this.admin,
            "superAdmin": this.superAdmin,
            "password": this.password
        });
    }

    deserialize(input: any): void {
        super.deserialize(input);
        this.email = input.email;
        this.organizationId = input.organizationId;
        if (input.organization) {
            this.organization.deserialize(input.organization);
        }
        if (input.atlassianId) {
            this.atlassianId = input.atlassianId;
        }
        if (input.authProviderId) {
            this.authProviderId = input.authProviderId;
        }
        if (input.requirePassword) {
            this.requirePassword = input.requirePassword;
        }
        this.admin = input.admin;
        this.superAdmin = input.superAdmin;
    }

    getBackendUrl(): string {
        return "/user/";
    }

    async save(): Promise<User> {
        return Ajax.saveEntity(this, this.getBackendUrl()).then(() => this);
    }

    async delete(): Promise<void> {
        return Ajax.delete(this.getBackendUrl() + this.id).then(() => undefined);
    }

    async setPassword(password: string): Promise<void> {
        let payload = {password: password};
        return Ajax.putData(this.getBackendUrl() + this.id + "/password", payload).then(() => undefined);
    }

    static async initMerge(targetUserEmail: string): Promise<void> {
        let payload = {email: targetUserEmail};
        return Ajax.postData("/user/merge/init", payload).then(() => undefined);
    }

    static async finishMerge(actionId: string): Promise<void> {
        return Ajax.postData("/user/merge/finish/" + actionId, null).then(() => undefined);
    }

    static async getMergeRequests(): Promise<MergeRequest[]> {
        return Ajax.get("/user/merge").then(result => {
            let list: MergeRequest[] = [];
            (result.json as []).forEach((item: any) => {
                let e: MergeRequest = new MergeRequest(item.id, item.email, item.userId);
                list.push(e);
            });
            return list;
        });
    }

    static async getCount(): Promise<number> { 
        return Ajax.get("/user/count").then(result => {
            return result.json.count;
        });
    }

    static async getSelf(): Promise<User> { 
        return Ajax.get("/user/me").then(result => {
            let e: User = new User();
            e.deserialize(result.json);
            return e;
        });
    }

    static async get(id: string): Promise<User> {
        return Ajax.get("/user/" + id).then(result => {
            let e: User = new User();
            e.deserialize(result.json);
            return e;
        });
    }

    static async list(): Promise<User[]> {
        return Ajax.get("/user/").then(result => {
            let list: User[] = [];
            (result.json as []).forEach(item => {
                let e: User = new User();
                e.deserialize(item);
                list.push(e);
            });
            return list;
        });
    }
}
