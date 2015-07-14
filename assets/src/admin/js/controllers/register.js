export default (app) => {

  function callListener(e, eventName) {
    // STOP default action
    e.preventDefault();
    e.stopImmediatePropagation();

    // Emit event
    console.log(`Emit: ${eventName}`);
    app.emit(eventName, this);
  }

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

  return app;
}
