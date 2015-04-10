// this is just a demo. a more flexible version that handles multiple
// jqm widgets is in the main frameworks page
  $.widget("mobile.textinput", $.mobile.textinput, {
    attach: function(obj, path, cb) {
      // getter
      if (!obj || !path) return !!this._attachment;
      // setter
      if (this._attachment) {
        this._attachment.close();
      }
      var theCB = cb;
      this._attachment = new PathObserver(obj, path);
      var wdf = function(newValue, oldValue) {
//        console.log(this, "path changed", newValue);
//        console.log(this.element);
        this.element.val(newValue);
        this.element.textinput("refresh");
        if (theCB) cb(this.element);
      }.bind(this);
      this._attachment.open(wdf);
      wdf(Path.get(path).getValueFrom(obj));
      return this;
    },
    unattach: function() {
      this._attachment.close();
      delete this._attachment;
      return this;
    }
  });