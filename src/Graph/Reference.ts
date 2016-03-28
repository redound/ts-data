export default class Reference {

    public $type:string = "ref";
    public value:any[];

    public constructor(resourceName:string, resourceId:any) {
        this.value = [resourceName, resourceId];
    }
}
