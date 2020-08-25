export class MultiImageUpload {

    inject() {
        let fileElement = document.getElementsByName("image_file")[0] as HTMLInputElement;
        fileElement.multiple = true;
        let addImageBtn = document.getElementById("addimagebutton") as HTMLInputElement;
        addImageBtn.onclick = this.uploadBatchImages;
        addImageBtn.value = "Add All Images"
    }
    
    uploadBatchImages(){
        let fileElement = document.getElementsByName("image_file")[0] as HTMLInputElement;
        let fileList = fileElement.files;
        for(var i = 0; i < fileList.length; i++){
            let file = fileList[i];
            var _this = this;
            setTimeout(function(){
                MultiImageUpload.originalUploadImage(file);
            }, i * 1000); //1 request per second max
        }
    }
    
    //Directly taken from F-list's code with two minor changes to use a file in parameter instead of the FileList in the DOM (name: "image_file")
    static originalUploadImage(file : File) {
        let myWindow = window as any;
        myWindow.imageUploading = true;
        myWindow.$('#addimagebutton').prop('value', 'Uploading Image...')
        myWindow.$('#addimagebutton').prop('disabled', true);
        var formdata = new FormData();
        formdata.append("csrf_token", myWindow.FList.csrf_token());
        formdata.append("character_id", myWindow.editCharacterId);
        formdata.append("image_file", file);
        myWindow.$.ajax({
            type: "POST",
            url: myWindow.domain + "json/image-add.json",
            data: formdata,
            dataType: "json",
            processData: false,
            contentType: false,
            timeout: (120 * 1000),
            success: function(data : any) {
                myWindow.imageUploading = false;
                myWindow.$('#addimagebutton').prop('disabled', false);
                myWindow.$("#addimagebutton").prop("value", "Add All Images");
                if(data.error == '') {
                    myWindow.FList.Common_displayNotice("Image added successfully.");
                    myWindow.loadImages(myWindow.editCharacterId);
                } else {
                    myWindow.FList.Common_displayError("Error while uploading image: " + data.error);
                }
            },
            error: function(request : any, error : any, errorThrown : any) {
                myWindow.imageUploading = false;
                myWindow.$("#addimagebutton").prop("disabled", false);
                myWindow.$("#addimagebutton").prop("value", "Add Image");
                myWindow.FList.Common_displayError("Error while uploading image: " + error + ", " + errorThrown);
            }
        });
        return false;
    };
}