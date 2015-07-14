export default (app) => {

  function sendDataAjax(options) {
    $.ajax({
      url : options.formURL,
      type: options.method, // POST or PUT or PATCH
      data : options.postData,
      success:function(data, textStatus, jqXHR) {
        location.href = `${options.urlCallback}/${data._id}`;
      },
      error: function(jqXHR, textStatus, errorThrown) {
        // Show the errors to the gallery
        options.$errorMessage.html(`${jqXHR.responseJSON[0].msg}.`);
        options.$error.removeClass('hidden');

        // Enable the submit form button
        options.$btn.removeClass('disabled');
      }
    });
  }

  app.on('appStarted', () => {
    console.log(`${app.config.name} started`);
  });

  app.on('createGallery', (form) => {

    const $createGalleryError = $('#createGalleryError');
    const $createGalleryBtn = $('#createGalleryBtn');
    const options = {
      formURL: $(form).attr('action'),
      method: $(form).attr('method'),
      postData: $(form).serialize(),
      urlCallback: '/admin/galleries',
      $error: $createGalleryError,
      $errorMessage: $('#createGalleryError .message'),
      $btn: $createGalleryBtn
    }

    // Clear the error message div
    $createGalleryError.addClass('hidden');

    // Send Ajax
    sendDataAjax(options);

    // Disable the submit form button
    $createGalleryBtn.addClass('disabled');

  });

  app.on('editGallery', (form) => {

    const $editGalleryError = $('#editGalleryError');
    const $editGalleryBtn = $('#editGalleryBtn');
    const options = {
      formURL: $(form).attr('action'),
      method: $(form).attr('method'),
      postData: $(form).serialize(),
      urlCallback: '/admin/galleries',
      $error: $editGalleryError,
      $errorMessage: $('#editGalleryError .message'),
      $btn: $editGalleryBtn
    }

    // Clear the error message div
    $editGalleryError.addClass('hidden');

    // Send Ajax
    sendDataAjax(options);

    // Disable the submit form button
    $editGalleryBtn.addClass('disabled');

  });

  app.on('deleteGallery', (btn) => {

    if(!confirm('Are you sure to want delete this gallery?')) return false;

    const $btn = $(btn);

    const request = $.ajax({
      url: `/api/galleries/${$btn.data('id')}`,
      beforeSend: function (request) {
        request.setRequestHeader('csrf-token', window.csrf);
      },
      method: 'DELETE'
    });

    request.done(function(msg) {
      if(window.urlreload) return location.href = window.urlreload;
    });

    request.fail(function( jqXHR, textStatus ) {
      console.error(`Request failed: ${textStatus}`);
    });

  });

  return app;
}
