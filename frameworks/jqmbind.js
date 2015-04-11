/*globals PathObserver Path */
(function($) {
  var createWidgetDeltaFunction = function(that, widgettype, method, theCB) {
    var wdf = function(newValue, oldValue) {
      // console.log(that, "path changed", newValue);
      this.element[method](newValue);
      this.element[widgettype]("refresh");
      if (theCB) theCB(this.element);
    }.bind(that);
    return wdf;
  };

  var createAttachmentHash = function(widgettype, method) {
    method = method || "val";
    var rv = {
      attach: function(obj, path, cb) {
        // getter
        if (!obj || !path) return !!this._attachment;
        // setter
        if (this._attachment) {
          this._attachment.close();
        }
        var theCB = cb;
        this._attachment = new PathObserver(obj, path);
        var wdf = createWidgetDeltaFunction(this, widgettype, method, theCB);
        this._attachment.open(wdf);
        // now init the value
        wdf(Path.get(path).getValueFrom(obj));
        return this;
      },
      unattach: function() {
        this._attachment.close();
        delete this._attachment;
        return this;
      }
    };
    return rv;
  };

  var addAttachmentHash = function(widgettype) {
    $.widget("mobile." + widgettype, $.mobile[widgettype], createAttachmentHash(widgettype));
  };

  var widgettypes = [
      "textinput", "flipswitch", "slider", "selectmenu"
  ];
  widgettypes.forEach(function(w) {
    addAttachmentHash(w);
  });
  // checkboxradio doesn't use val()
  $.widget("mobile.checkboxradio", $.mobile.checkboxradio, {
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
        // console.log(that, "path changed", newValue);
        this.element.prop('checked', newValue);
        this.element.checkboxradio("refresh");
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

  // bind selectmenu options
  $.widget("mobile.selectmenu", $.mobile.selectmenu, {
    attachOptions: function(obj, path, options, cb) {
      // getter
      if (!obj || !path) return !!this._attachment;
      // setter
      if (this._attachment2) {
        this._attachment2.close();
      }
      var theCB = cb;
      this._attachment2 = new PathObserver(obj, path);
      options = options || {defaultValue : {key: '', value : ''}};
      var wdf = function(newValue, oldValue) {
        newValue = newValue || [];
        
        var e = this.element;
        e.empty().append($("<option/>", {
          value: options.defaultValue.key,
          text: options.defaultValue.value
        }));
        $.each(newValue, function(key, value) {
          e.append($("<option/>", {
            value: options.key ? value[options.key] : key,
            text: options.value ? value[options.value] : value
          }));
        });
        this.element.selectmenu("refresh");
        if (theCB) cb(this.element);
      }.bind(this);
      this._attachment2.open(wdf);
      wdf(Path.get(path).getValueFrom(obj));
      return this;
    },
    unattachOptions: function() {
      this._attachment2.close();
      delete this._attachment2;
      return this;
    }
  });

  // watch whole array and apply formatter to create new ul content
  // formatter needs to safely encode the content strings
  $.widget("mobile.listview", $.mobile.listview, {
    attach: function(obj, path, formatter, cb) {
      // getter
      if (!obj || !path) return !!this._attachment;
      // setter
      if (this._attachment) {
        this._attachment.close();
      }
      this._attachment = new PathObserver(obj, path);
      var theCB = cb;
      var wdf = function(newValue, oldValue) {
        this.element.contents().remove();
        newValue = newValue || [];
        var c = "";
        for (var i = 0; i < newValue.length; ++i) {
          c+= formatter(newValue[i], i);
        }
        this.element.html(c);
        this.element.listview("refresh");
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

  $.fn.extend({
    attach: function(obj, path, formatter) {
      if (this._attachment) {
        this._attachment.close();
      }
      this._attachment = new PathObserver(obj, path);
      var wdf = function(newValue, oldValue) {
        if (this.is('img')) this.attr('src', newValue);
        else {
          if (formatter) formatter(newValue, this);
          else this.html(newValue);
        }
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

})(jQuery);
