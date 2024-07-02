class ApiResponse {
    constructor(statusCode,data,message="succes"){
        this.statusCode=statusCode
        this.data=data
        this.message=message
        this.succuess=statusCode<400
    }
}

export {ApiResponse}