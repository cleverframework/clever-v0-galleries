import {FileUploader} from 'file-uploader-sdk';

export default (app) => {

  function callListener(e, eventName) {
    // STOP default action
    e.preventDefault();
    e.stopImmediatePropagation();

    // Emit event
    console.log(`Emit: ${eventName}`);
    app.emit(eventName, this);
  }

  const FileUploaderInstance = new FileUploader('#imageUploaderContainer', '#imageUploaderMediaController',  {
    maxFileSize: -1,
    metadataName: 'cropper_images',
    uploaderApiPath: `/api/galleries/${window.galleryId}/images`,
    metadataApiPath: '/api/files/metadata',
    acceptFileTypes: 'image/jpg,image/jpeg,image/gif,image/png',
    croppers: [
      // {
      //   name: '16:9',
      //   value: 16/9
      // },
      {
        name: '4:3',
        value: 4/3
      },
      {
        name: '1:1',
        value: 1/1
      }
    ]
  });

  $('.deleteGallery').click(function(e) {
    callListener.call(this, e, 'deleteGallery');
  });

  $('#createGallery').submit(function(e) {
    callListener.call(this, e, 'createGallery');
  });

  $('#editGallery').submit(function(e) {
    callListener.call(this, e, 'editGallery');
  });

  $('#inputTitle').bind('keyup mouseup', function(e) {
    let replaced = $(this).val().replace(/ /g,'-');
    replaced = replaced.replace(/'/g,'-');
    replaced = replaced.replace(/[&\/\\#,+()$~%.":*?!`|<>{}]/g,'');
    $('#inputSlug').val(replaced.toLowerCase());
  });

  $('.deleteImage').click(function(e) {
    callListener.call(this, e, 'deleteImage');
  });

  $('#editImage').submit(function(e) {
    callListener.call(this, e, 'editImage');
  });

  return app;
}
