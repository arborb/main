/**
 * jWindow: jQuery Windows Engine 2 Copyright (c) 2011 Dominik Marczuk All rights reserved. Redistribution and use in
 * source and binary forms, with or without modification, are permitted provided that the following conditions are met: *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following
 * disclaimer. * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution. * The name of
 * Dominik Marczuk may not be used to endorse or promote products derived from this software without specific prior
 * written permission. THIS SOFTWARE IS PROVIDED BY DOMINIK MARCZUK "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 * INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL DOMINIK MARCZUK BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
 * ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * based on jQuery Windows Engine Plugin Copyright(c) Hernan Amiune (hernan.amiune.com) Licensed under MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 */

(function($) {
  /**
   * The zIndex value for window arranging
   */
  var zIndex = 100;

  /**
   * The array containing all of the defined windows
   */
  var jWindows = [ ];

  // var focusList = [];

  /**
   * A counter for tabs IDs
   */
  var tabCounter = 0;

  /**
   * The jWindow object is what controls the entire widget.
   * 
   * @param params
   *          options an object containing the options values.
   */
  function jWindow(params) {
    // this, for faster reference :)
    var $jWindow = this;

    // user-assignable options
    var options = {
      id: "",
      title: "",
      subTitle: "",
      parentElement: 'body',
      width: 300,
      height: 200,
      minWidth: 500,
      minHeight: 400,
      posx: 50,
      posy: 50,
      userData: {},
      windowType: 1,
      fixed: false,
      popupWindow: false,
      animationDuration: 350,
      onDragStart: null,
      onDragEnd: null,
      onResizeStart: null,
      onResizeEnd: null,
      onUpdate: null,
      onClose: null,
      onFocus: null,
      onMaximise: null,
      onRestore: null,
      onMinimise: null,
      statusBar: true,
      refreshButton: false,
      minimiseButton: true,
      maximiseButton: true,
      closeButton: true,
      draggable: true,
      resizeable: true,
      containment: false,
      type: "iframe",
      url: "",
      modal: false,
      tabs: false
    };
    $.extend(options, params);

    // different states of the window
    var state = {
      minimised: false,
      maximised: false,
      hidden: true,
      focus: false
    };

    // create the DOM structure for the jWindow
    var domNodes = {
      parentElement: $(options.parentElement),
      modalBackground: $('<div class="jWindow-modalBackground" tabIndex="0" style="outline: none;"></div>').css({
        zIndex: 1250,
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%'
      }),
      container: $('<div id="' + options.id + '" class="jWindow"></div>').css({
        position: (options.fixed) ? "fixed" : "absolute",
        width: options.width + 'px',
        'min-width': options.minWidth + 'px',
        top: options.posy + 'px',
        left: options.posx + 'px',
        overflow: 'hidden'
      }),
      titleBar: $('<div class="jWindow-titleBar"></div>').css({
        position: 'relative',
        overflow: 'hidden'
      }),
      title: $('<div class="jWindow-title"></div>').text(options.title),
      subtitle: $('<div class="jWindow-subtitle"></div>').text(options.subtitle),
      refreshButton: $('<div class="jWindow-button jWindow-refreshButton"></div>'),
      minimiseButton: $('<div class="jWindow-button jWindow-minimiseButton"></div>'),
      maximiseButton: $('<div class="jWindow-button jWindow-maximiseButton"></div>'),
      closeButton: $('<div class="jWindow-button jWindow-closeButton"></div>'),
      tabsBar: $('<div class="jWindow-tabsBar"></div>').css({
        position: 'relative',
        overflow: 'hidden'
      }),
      tabs: $('<ul class="jWindow-tabs"></ul>'),
      wrapper: $('<div class="jWindow-wrapper"></div>').css({
        overflow: 'hidden'
      }),
      content: $('<div class="jWindow-content"></div>').css({
        height: options.height + 'px',
        'min-height': options.minHeight + 'px'
      }),
      statusBar: $('<div class="jWindow-statusBar"></div>').css({
        position: 'relative'
      }),
      resizeIcon: $('<div class="jWindow-resizeIcon"></div>').css({
        position: 'absolute',
        bottom: '0',
        right: '0'
      }),
      iframeCover: $('<div class="jWindow-iframeCover"></div>').css({
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 1252
      }),
      output: null
    };

    domNodes.container.appendTo(domNodes.modalBackground);
    domNodes.titleBar.appendTo(domNodes.container);
    domNodes.tabs.appendTo(domNodes.tabsBar);
    if (options.tabs) domNodes.tabsBar.appendTo(domNodes.wrapper);
    domNodes.content.appendTo(domNodes.wrapper);
    if (options.statusBar) domNodes.statusBar.appendTo(domNodes.wrapper);
    domNodes.wrapper.appendTo(domNodes.container);
    domNodes.title.appendTo(domNodes.titleBar);
    // TODO: version, version 정보 Ctrl+클릭시 iframe 새로고침
    domNodes.subtitle.appendTo(domNodes.titleBar).click(function(e) {
      if (e.ctrlKey === true) {
        var iframeId = "#ifra" + options.id.replace(/^#div|^div/i, "");
        $(iframeId)[0].contentWindow.location.reload(true);
      }
    });
    domNodes.modalBackground.focus(function(e) {
      domNodes.container.focus();
    });
    if (options.refreshButton) domNodes.refreshButton.appendTo(domNodes.titleBar);
    if (options.minimiseButton) domNodes.minimiseButton.appendTo(domNodes.titleBar);
    if (options.maximiseButton) domNodes.maximiseButton.appendTo(domNodes.titleBar);
    if (options.closeButton) domNodes.closeButton.appendTo(domNodes.titleBar);

    if (options.modal) {
      domNodes.output = domNodes.modalBackground;
      domNodes.container.css({
        'zIndex': 1251,
        'outline': 'none'
      }).prop('tabIndex', 0);
    } else {
      domNodes.output = domNodes.container.css({
        'zIndex': ++zIndex,
        'outline': 'none'
      }).prop('tabIndex', 0);
    }
    domNodes.output.css({
      opacity: '0'
    });

    // ----------------------------------
    // BIND EVENTS TO DIFFERENT DOM NODES
    // ----------------------------------

    // click on anything
    $.each(domNodes, function() {
      if (this != domNodes.parentElement) {
        $(this).on({
          mousedown: function() {
            $jWindow.focus();
          }
        });
      }
    });

    // click on the close button
    domNodes.closeButton.on({
      click: function() {
        if ($.isFunction(options.onClose)) {
          $jWindow.hide(options.onClose($jWindow));
        } else {
          $jWindow.hide();
        }
      }
    });

    // click on the minimise button
    domNodes.minimiseButton.on({
      click: function() {
        if (domNodes.container.hasClass('minimised')) {
          $jWindow.restore({
            type: 'min',
            complete: options.onRestore
          });
        } else {
          $jWindow.minimise(options.onMinimise);
        }
      }
    });

    // click on the maximise button
    domNodes.maximiseButton.on({
      click: function(event) {
        if (domNodes.container.hasClass('maximised')) {
          $jWindow.restore({
            type: 'max',
            complete: options.onRestore
          });
        } else {
          $jWindow.maximise(options.onMaximise);
        }
      }
    });

    // click on the refresh button
    domNodes.refreshButton.on({
      click: function() {
        if (options.type != 'custom') {
          $jWindow.refresh();
        }
      }
    });

    // double click on the title bar to maximise, mousedown for dragging
    domNodes.titleBar.on({
      dblclick: function() {
        if (options.popupWindow) {
          return;
        }
        if (domNodes.container.hasClass('maximised')) {
          $jWindow.restore({
            type: 'max',
            complete: options.onRestore
          });
        } else {
          $jWindow.maximise(options.onMaximise);
        }
      }
    });

    // --------------
    // SPECIAl EVENTS
    // --------------

    // set focus on mouse down:
    domNodes.content.on({
      jWindowCover: function() {
        domNodes.iframeCover.prependTo(domNodes.content);
      },
      jWindowUncover: function() {
        domNodes.iframeCover.detach();
      }
    });

    // resize the window (using a custom event) -> adjust the windows:
    // $(window).resize(function() {
    // if (this.resizeTO) clearTimeout(this.resizeTO);
    // this.resizeTO = setTimeout(function() {
    // $(this).trigger('resizeEnd');
    // }, 1000);
    // }).on({
    // resizeEnd: function() {
    // for ( var i = 0; i < jWindows.length; ++i) {
    // jWindows[i].set({}); // will trigger fitting in viewport
    // }
    // }
    // });

    // -----------------------
    // JWINDOW PRIVATE METHODS
    // -----------------------
    /**
     * Perform a cleanup after dragging or resizing a window or the viewport - adjust the position and size of the
     * window to fit the viewport.
     * 
     * @return jWindow Provides a fluent interface
     */
    var fitInViewport = function() {
      // calculate margins
      var containerW = domNodes.container.outerWidth();
      var containerH = domNodes.container.outerHeight();
      var marginX = containerW - options.width;
      var marginY = containerH - options.height;
      var maxW = 0, maxH = 0;
      var offsetX = 0, offsetY = 0;

      if (options.containment && domNodes.parentElement) {
        // if (domNodes.parentElement.css("position") == "absolute") {
        // offsetX = 0;
        // offsetY = 0;
        // } else {
        // offsetX = domNodes.parentElement.offset().left;
        // offsetY = domNodes.parentElement.offset().top;
        // }
        offsetX = 0;
        offsetY = 0;
        maxW = domNodes.parentElement.width();
        maxH = domNodes.parentElement.height();
      } else {
        offsetX = 0;
        offsetY = 0;
        maxW = $(window).width();
        maxH = $(window).height();
      }

      // step 1: check if the size isn't larger than the viewport:
      // step 2: check if the size isn't too small:
      if (containerW > maxW) {
        options.width = maxW - marginX;
      }
      if (options.width < options.minWidth) {
        options.width = options.minWidth;
      }
      if (containerH > maxH) {
        options.height = maxH - marginY;
      }
      if (options.height < options.minHeight) {
        options.height = options.minHeight;
      }

      // step 3: check if the window doesn't go outside the right/bottom edge of the viewport:
      // step 4: make sure the window doesn't go outside the left/top edge of the viewport:
      if (options.posx + containerW > maxW + offsetX) {
        options.posx = maxW + offsetX - options.width - marginX;
      }
      if (options.posx < offsetX) {
        options.posx = offsetX;
      }
      if (options.posy + containerH > maxH + offsetY) {
        options.posy = maxH + offsetY - options.height - marginY;
      }
      if (options.posy < offsetY) {
        options.posy = offsetY;
      }

      // TODO: // Safari -> CSS calc가 적용이 안되어 width 계산
      domNodes.title.width(Math.max(options.minWidth, options.width) - 165);

      // adjust the window:
      domNodes.container.animate({
        top: options.posy + 'px',
        left: options.posx + 'px',
        width: options.width + 'px'
      }, options.animationDuration, 'swing');
      domNodes.content.animate({
        height: options.height + 'px'
      }, options.animationDuration, 'swing');
    };

    /**
     * Sets the draggable option on a window, and attaches or detaches a onmousedown event associated with it.
     * 
     * @param draggable
     *          whether to make the window draggable or not draggable (optional parametre; defaults to true)
     * @return jWindow Provides a fluent interface
     */
    var setDraggable = function(draggable) {
      if (typeof draggable == 'undefined' || draggable == undefined) draggable = true;
      options.draggable = !!draggable; // double negation to ensure the parametre is a boolean

      var startX = 0, startY = 0;
      var startPosX = 0, startPosY = 0;
      var containerW = 0, containerH = 0;
      var offsetX = 0, offsetY = 0;
      var maxX = 0, maxY = 0;

      if (options.draggable && !state.maximised) {
        domNodes.titleBar.css('cursor', 'move').on({
          mousedown: function(event) {
            // get initial mouse position
            startX = event.screenX;
            startY = event.screenY;
            startPosX = options.posx;
            startPosY = options.posy;

            containerW = domNodes.container.outerWidth();
            containerH = domNodes.container.outerHeight();
            if (options.containment && domNodes.parentElement) {
              // if (domNodes.parentElement.css("position") == "absolute") {
              // offsetX = 0;
              // offsetY = 0;
              // } else {
              // offsetX = domNodes.parentElement.offset().left;
              // offsetY = domNodes.parentElement.offset().top;
              // }
              offsetX = 0;
              offsetY = 0;
              maxX = Math.max(domNodes.parentElement.width() + offsetX - containerW, containerW);
              maxY = Math.max(domNodes.parentElement.height() + offsetY - containerH, containerH);
            } else {
              offsetX = 0;
              offsetY = 0;
              maxX = $(window).width();
              maxY = $(window).height();
            }

            domNodes.content.trigger('jWindowCover');

            $(document).on({
              mousemove: function(event) {
                if (options.draggable) {
                  options.posx = startPosX + event.screenX - startX;
                  if (options.posx < offsetX) {
                    options.posx = offsetX;
                  } else if (options.posx > maxX) {
                    options.posx = maxX;
                  }
                  options.posy = startPosY + event.screenY - startY;
                  if (options.posy < offsetY) {
                    options.posy = offsetY;
                  } else if (options.posy > maxY) {
                    options.posy = maxY;
                  }

                  domNodes.container.css({
                    'top': options.posy + 'px',
                    'left': options.posx + 'px'
                  });
                }
              },
              mouseup: function() {
                // unbind the events
                $(document).off('mousemove mouseup');
                domNodes.content.trigger('jWindowUncover');

                fitInViewport();

                // launch the callback
                if (typeof options.onDragEnd == 'function') {
                  options.onDragEnd();
                }
              }
            });

            // drag start callback
            if (typeof options.onDragStart == 'function') {
              options.onDragStart();
            }

            // disable selection, so that no text is selected while dragging
            domNodes.titleBar[0].onselectstart = function() {
              return false;
            }; // IE
            return false; // other browsers
          }
        });
      } else {
        domNodes.titleBar.css('cursor', 'default').off('mousedown');
        // re-enable selection in IE
        domNodes.titleBar[0].onselectstart = null;
      }

      return $jWindow;
    };

    // make the window draggable (or not)
    setDraggable(options.draggable);

    /**
     * Sets the resizeable option on a window, and attaches or detaches the events associated with it.
     * 
     * @param resizeable
     *          whether to make the window resizeable or static-sized (optional parametre; defaults to true)
     * @return jWindow Provides a fluent interface
     */
    var setResizeable = function(resizeable) {
      if (typeof resizeable == 'undefined' || resizeable == undefined) resizeable = true;
      options.resizeable = !!resizeable; // double negation to ensure the parametre is a boolean

      var startX = 0, startY = 0;
      var startW = 0, startH = 0;
      var parentW = 0, parentH = 0;

      if (options.resizeable && !state.maximised && !state.minimised) {
        domNodes.resizeIcon.appendTo(domNodes.statusBar);
        domNodes.resizeIcon.css('cursor', 'se-resize').on({
          mousedown: function(event) {
            // get initial mouse position and sizes
            startX = event.screenX;
            startY = event.screenY;
            startW = domNodes.container.width();
            startH = domNodes.content.height();
            if (options.containment && domNodes.parentElement) {
              parentW = domNodes.parentElement.width();
              parentH = domNodes.parentElement.height();
            } else {
              parentW = $(window).width();
              parentH = $(window).height();
            }
            parentW -= (domNodes.container.outerWidth() - options.width);
            parentH -= (domNodes.container.outerHeight() - options.height);

            domNodes.content.trigger('jWindowCover');

            $(document).on({
              mousemove: function(event) {
                if (options.resizeable) {
                  options.width = startW + event.screenX - startX;
                  options.height = startH + event.screenY - startY;
                  if (options.width > parentW) {
                    options.width = parentW;
                  } else if (options.width < options.minWidth) {
                    options.width = options.minWidth;
                  }
                  if (options.height > parentH) {
                    options.height = parentH;
                  } else if (options.height < options.minHeight) {
                    options.height = options.minHeight;
                  }

                  domNodes.container.css({
                    width: options.width + 'px'
                  });
                  domNodes.content.css({
                    height: options.height + 'px'
                  });

                  // TODO: // Safari -> CSS calc가 적용이 안되어 width 계산
                  domNodes.title.width(Math.max(options.minWidth, options.width) - 165);
                }
              },
              mouseup: function(event) {
                // unbind the events
                $(document).off('mousemove mouseup');
                domNodes.content.trigger('jWindowUncover');

                fitInViewport();

                // launch the callback
                if (typeof options.onResizeEnd == 'function') {
                  options.onResizeEnd();
                }
              }
            });

            // drag start callback
            if (typeof options.onResizeStart == 'function') {
              options.onResizeStart();
            }

            // disable selection, so that no text is selected while resizing
            domNodes.resizeIcon[0].onselectstart = function() {
              return false;
            }; // IE
            return false; // other browsers
          }
        });
      } else {
        domNodes.resizeIcon.detach();
        domNodes.resizeIcon.css('cursor', 'default').off('mousedown');
        // re-enable selection in IE
        domNodes.resizeIcon[0].onselectstart = null;
      }

      return $jWindow;
    };

    // make the window resizeable (or not)
    setResizeable(options.resizeable);

    /**
     * Check whether a window is hidden or not
     * 
     * @return boolean
     */
    $jWindow.isHidden = function() {
      return state.hidden;
    };

    /**
     * Remove jWindows Array
     */
    $jWindow.removeWindow = function() {

      var removeId = options.id;
      for (var i = 0; i < jWindows.length; ++i) {
        if (jWindows[i].get('id') == removeId) {
          jWindows.splice(i, 1);
          break;
        }
      }
    };

    /**
     * Bring the last focused window back to focus. Used after hiding a window.
     * 
     * @return jWindow Provides a fluent interface
     */
    /*
     * var restoreFocus = function () { var done = false; while (!done && focusList.length > 0) { var i =
     * focusList.pop(); if (console) { console.log("popped: "+i); console.log(focusList); } if
     * (!jWindows[i].isHidden()) { jWindows[i].focus(); done = true; } }; return $jWindow; };
     */

    // ----------------------
    // JWINDOW PUBLIC METHODS
    // ----------------------
    /**
     * Add the window widget to the DOM tree and fade it in
     * 
     * @param params
     *          can be one of several things:<br>
     *          a number - denotes the animation's duration (in milliseconds)<br>
     *          a string - denotes the animation's easing<br>
     *          a function - a complete callback to the animation<br>
     *          an object - duration, easing and complete properties will be used
     * @return jWindow Provides a fluent interface
     */
    $jWindow.show = function(params) {
      if (!state.hidden) return $jWindow;

      var _options = {
        duration: options.animationDuration,
        easing: 'linear',
        complete: function() {
        }
      };

      switch (typeof params) {
      case 'number':
        _options.duration = params;
        break;
      case 'string':
        _options.easing = params;
        break;
      case 'function':
        _options.complete = params;
        break;
      case 'object':
        $.extend(_options, params);
        break;
      }

      domNodes.parentElement.append(domNodes.output.css({
        opacity: '0'
      }));
      domNodes.output.animate({
        opacity: '1'
      }, _options.duration, _options.easing, _options.complete);
      state.hidden = false;
      $jWindow.focus();

      return $jWindow;
    };

    /**
     * Fade the window widget out and detach it from the DOM tree
     * 
     * @param params
     *          can be one of several things:<br>
     *          a number - denotes the animation's duration (in milliseconds)<br>
     *          a string - denotes the animation's easing<br>
     *          a function - a complete callback to the animation<br>
     *          an object - duration, easing and complete properties will be used
     * @return jWindow Provides a fluent interface
     */
    $jWindow.hide = function(params) {
      if (state.hidden) return $jWindow;

      var _options = {
        duration: options.animationDuration,
        easing: 'linear',
        complete: function() {
        }
      };

      switch (typeof params) {
      case 'number':
        _options.duration = params;
        break;
      case 'string':
        _options.easing = params;
        break;
      case 'function':
        _options.complete = params;
        break;
      case 'object':
        $.extend(_options, params);
        break;
      }

      domNodes.output.animate({
        // top: '-=15px',
        opacity: '1'
      }, _options.duration, _options.easing, function() {
        domNodes.output = domNodes.output.css({
          // top: '+=15px'
          opacity: '0'
        }).detach();
        _options.complete();
      });
      state.hidden = true;
      $jWindow.focus(false);
      // restoreFocus();

      return $jWindow;
    };

    /**
     * Minimise the window
     * 
     * @param params
     *          can be one of several things:<br>
     *          a number - denotes the animation's duration (in milliseconds)<br>
     *          a string - denotes the animation's easing<br>
     *          a function - a complete callback to the animation<br>
     *          an object - duration, easing and complete properties will be used
     * @return jWindow Provides a fluent interface
     */
    $jWindow.minimise = function(params) {
      if (state.minimised) return $jWindow;

      var _options = {
        duration: options.animationDuration,
        easing: 'linear',
        complete: function() {
        }
      };

      switch (typeof params) {
      case 'number':
        _options.duration = params;
        break;
      case 'string':
        _options.easing = params;
        break;
      case 'function':
        _options.complete = params;
        break;
      case 'object':
        $.extend(_options, params);
        break;
      }

      domNodes.wrapper.slideUp(_options.duration, _options.easing, _options.complete);
      domNodes.container.addClass('minimised');
      state.minimised = true;

      setResizeable(options.resizeable);

      return $jWindow;
    };

    /**
     * Maximise the window
     * 
     * @param params
     *          can be one of several things:<br>
     *          a number - denotes the animation's duration (in milliseconds)<br>
     *          a string - denotes the animation's easing<br>
     *          a function - a complete callback to the animation<br>
     *          an object - duration, easing and complete properties will be used
     * @return jWindow Provides a fluent interface
     */
    $jWindow.maximise = function(params) {
      if (state.maximised || state.minimised) return $jWindow;

      var _options = {
        duration: options.animationDuration,
        easing: 'linear',
        complete: function() {
        }
      };

      switch (typeof params) {
      case 'number':
        _options.duration = params;
        break;
      case 'string':
        _options.easing = params;
        break;
      case 'function':
        _options.complete = params;
        break;
      case 'object':
        $.extend(_options, params);
        break;
      }

      var marginX = domNodes.container.outerWidth() - options.width;
      var marginY = domNodes.container.outerHeight() - options.height;
      var offsetX = 0, offsetY = 0;
      var parentW = 0, parentH = 0;
      if (options.containment && domNodes.parentElement) {
        // if (domNodes.parentElement.css("position") == "absolute") {
        // offsetX = 0;
        // offsetY = 0;
        // } else {
        // offsetX = domNodes.parentElement.offset().left;
        // offsetY = domNodes.parentElement.offset().top;
        // }
        offsetX = 0;
        offsetY = 0;
        parentW = domNodes.parentElement.width() - marginX;
        parentH = domNodes.parentElement.height() - marginY;
      } else {
        offsetX = 0;
        offsetY = 0;
        parentW = $(window).width() - marginX;
        parentH = $(window).height() - marginY;
      }

      domNodes.container.animate({
        width: parentW + 'px',
        top: offsetY + 'px',
        left: offsetX + 'px'
      }, _options.duration, _options.easing, function() {
        // TODO: // Safari -> CSS calc가 적용이 안되어 width 계산
        domNodes.title.width(Math.max(options.minWidth, parentW) - 165);
        _options.complete();
      });
      domNodes.content.animate({
        height: parentH + 'px'
      }, _options.duration, _options.easing);
      domNodes.container.addClass('maximised');
      domNodes.maximiseButton.removeClass("jWindow-maximiseButton");
      domNodes.maximiseButton.addClass("jWindow-maximisedButton");
      state.maximised = true;

      setResizeable(options.resizeable);
      setDraggable(options.draggable);

      return $jWindow;
    };

    /**
     * Restore the window from the minimised or maximised state
     * 
     * @param params
     *          can be one of several things:<br>
     *          a number - denotes the animation's duration (in milliseconds)<br>
     *          a string - denotes the animation's easing<br>
     *          a function - a complete callback to the animation<br>
     *          an object - duration, easing, complete and type ('min', 'max' or 'both') properties will be used
     * @return jWindow Provides a fluent interface
     */
    $jWindow.restore = function(params) {
      if (!state.minimised && !state.maximised) return $jWindow;

      var _options = {
        duration: options.animationDuration,
        easing: 'linear',
        complete: function() {
        },
        type: 'both'
      };

      switch (typeof params) {
      case 'number':
        _options.duration = params;
        break;
      case 'string':
        _options.easing = params;
        break;
      case 'function':
        _options.complete = params;
        break;
      case 'object':
        $.extend(_options, params);
        break;
      }

      if (domNodes.container.hasClass('minimised') && $.inArray(_options.type, ['min', 'both']) != -1) {
        domNodes.wrapper.slideDown(_options.duration, _options.easing, _options.complete);
        domNodes.container.removeClass('minimised');
        state.minimised = false;
      }
      if (domNodes.container.hasClass('maximised') && $.inArray(_options.type, ['max', 'both']) != -1) {
        domNodes.container.animate({
          width: options.width + 'px',
          top: options.posy + 'px',
          left: options.posx + 'px'
        }, _options.duration, _options.easing, _options.complete);
        domNodes.content.animate({
          height: options.height + 'px'
        }, _options.duration, _options.easing);
        // TODO: // Safari -> CSS calc가 적용이 안되어 width 계산
        domNodes.title.animate({
          width: (Math.max(options.minWidth, options.width) - 165) + 'px'
        }, _options.duration, _options.easing);
        domNodes.container.removeClass('maximised');
        domNodes.maximiseButton.removeClass("jWindow-maximisedButton");
        domNodes.maximiseButton.addClass("jWindow-maximiseButton");
        state.maximised = false;
      }

      setResizeable(options.resizeable);
      setDraggable(options.draggable);

      return $jWindow;
    };

    /**
     * Set focus on the window. Remove focus from all other windows.
     * 
     * @param focus
     *          whether to add or remove focus from the window
     * @return jWindow Provides a fluent interface
     */
    $jWindow.focus = function(focus) {
      if (typeof focus == 'undefined' || focus == undefined) focus = true;
      focus = !!focus; // make sure focus is a boolean

      // if the window's focus is already set correctly, do nothing
      if (state.focus == focus) {
        domNodes.container.focus();
        return $jWindow;
      }

      if (focus) {
        // zIndex Reset
        var zIndexReset = false;
        if (zIndex > 600) {
          zIndexReset = true;

          jWindows.sort(function(jWin1, jWin2) {
            return jWin1.getContainerNode().css("zIndex") - jWin2.getContainerNode().css("zIndex");
          });
          zIndex = 100;
        }
        // blur all windows
        var jWin = null;
        for (var i = 0; i < jWindows.length; ++i) {
          jWin = jWindows[i];
          if (jWin.hasFocus()) {
            jWin.focus(false);
            // focusList.push(i);
            // if (console) {
            // console.log(focusList);
            // }
          }

          if (zIndexReset) {
            if (!jWin.get("modal")) {
              jWin.getContainerNode().css('zIndex', ++zIndex);
            }
          }
        }

        // focus the current window
        domNodes.container.removeClass('blur').addClass('focus');
        domNodes.content.trigger('jWindowUncover');
        state.focus = true;
        if (options.modal) {
          domNodes.container.css('zIndex', '1251');
        } else {
          domNodes.container.css('zIndex', ++zIndex);
        }
        domNodes.container.focus();
        if ($.isFunction(options.onFocus)) {
          options.onFocus($jWindow);
        }
      } else {
        if (!options.modal) {
          domNodes.container.removeClass('focus').addClass('blur');
          domNodes.content.trigger('jWindowCover');

          state.focus = false;
        }
      }
      return $jWindow;
    };

    /**
     * Check the window's focus.
     * 
     * @return boolean
     */
    $jWindow.hasFocus = function() {
      return state.focus;
    };

    /**
     * Update the content of a window.
     * 
     * @param param
     *          In case of an iframe window, this parametre is optional. If specified, it will be treated as an URL that
     *          will be loaded in the iframe. If left empty, the iframe's content will just be loaded (if the URL option
     *          has been passed to the jWindow's constructor) or reloaded (if the iframe has been loaded previously).<br>
     *          In an AJAX window, the parametre is optional. If specified, it will be used as the URL to load via AJAX.
     *          If not specified, the URL set in the jWindow's constructor will be used. If that is not present either,
     *          nothing will happen.<br>
     *          In a custom content window, the parametre is the custom HTML that will be placed inside the window. The
     *          parametre is mandatory.<br>
     *          In either case, passing a NULL value will clear the jWindow's content.
     * @return jWindow Provides a fluent interface
     */
    $jWindow.update = function(param) {
      if (param === null) {
        options.url = null;
        domNodes.content.empty();
      } else if (options.type == 'iframe') {
        var iframeId = "ifra" + options.id.replace(/^#div|^div/i, "");
        if (typeof param == 'string') {
          options.url = param;
          domNodes.content.html('<iframe id="' + iframeId + '" name="' + iframeId + '" src="" frameBorder="0" />');
          var iframe = domNodes.content.find('iframe');
          iframe.css({
            border: 'none',
            width: '100%',
            height: '100%'
          });
          iframe.attr('src', options.url);
        } else {
          var frame = domNodes.content.find('iframe');
          if (frame.length > 0) {
            if (options.url.length == 0) options.url = frame[0].src;
            else
              frame[0].src = options.url;
          } else {
            if (options.url.length > 0) {
              domNodes.content.html('<iframe id="' + iframeId + '" name="' + iframeId + '" src="" frameBorder="0" />');
              var iframe = domNodes.content.find('iframe');
              iframe.css({
                border: 'none',
                width: '100%',
                height: '100%'
              });
              iframe.attr('src', options.url);
            }
          }
        }
      } else if (options.type == 'ajax') {
        if (typeof param == 'string') {
          options.url = param;
        }
        $.ajax({
          url: options.url,
          dataType: 'html',
          success: function(data) {
            domNodes.content.html('<div style="padding: 1px; margin: -1px;">' + data + '</div>');
          }
        });
      } else {
        domNodes.content.html('<div style="padding: 1px; margin: -1px;">' + param + '</div>');
      }
      return $jWindow;
    };

    /**
     * Refresh the content of the iframe
     * 
     * @return jWindow Provides a fluent interface
     */
    $jWindow.refresh = function() {
      if (options.type == 'iframe') domNodes.content.find('iframe').get(0).contentWindow.location.reload();
      return $jWindow;
    };

    /**
     * Retrieve an option value
     * 
     * @param param
     *          property's name to retrieve
     * @return the value of the selected option or undefined if ther is no such option
     */
    $jWindow.get = function(param) {
      return options[param];
    };

    /**
     * Container Element return
     * 
     * @return Container Element
     */
    $jWindow.getContainerNode = function() {
      return domNodes.container;
    };

    /**
     * A universal setter for jWindow options
     * 
     * @param param
     *          Either the name of the value to change or an object with name-value pairs.
     * @param value
     *          The new value of the property (use only if the first parametre is a string)
     * @return jWindow Provides a fluent interface
     */
    $jWindow.set = function(param, value) {
      if (typeof param == 'string') {
        var tmp = {};
        tmp[param] = value;
        param = tmp;
      }
      if (typeof param != 'object') {
        param = {};
      }

      $.each(param, function(prop, val) {
        switch (prop) {
        case 'title':
          options.title = val;
          domNodes.title.text(options.title);
          break;
        case 'subtitle':
          options.subtitle = val;
          domNodes.subtitle.text(options.subtitle);
          break;
        case 'posx':
          options.posx = val;
          domNodes.container.css({
            left: options.posx + 'px'
          });
          break;
        case 'posy':
          options.posy = val;
          domNodes.container.css({
            top: options.posy + 'px'
          });
          break;
        case 'width':
          options.width = val;
          domNodes.container.css({
            width: options.width + 'px'
          });
          break;
        case 'minWidth':
          options.minWidth = val;
          domNodes.container.css({
            "min-width": options.minWidth + 'px'
          });
          break;
        case 'height':
          options.height = val;
          domNodes.content.css({
            height: options.height + 'px'
          });
          break;
        case 'minHeight':
          options.minHeight = val;
          domNodes.container.css({
            "min-height": options.minHeight + 'px'
          });
          break;
        case 'resizeable':
          options.resizeable = val;
          setResizeable(options.resizeable);
          break;
        case 'draggable':
          options.draggable = val;
          setDraggable(options.draggable);
          break;
        case 'onDragStart':
        case 'onDragEnd':
        case 'onResizeStart':
        case 'onResizeEnd':
        case 'onUpdate':
        case 'onClose':
        case 'onFocus':
        case 'onMaximise':
        case 'onRestore':
        case 'onMinimise':
        case 'url':
        case 'windowType':
        case 'userData':
          options[prop] = val;
          break;
        case 'tabs':
          var initial = options.tabs;
          options.tabs = !!val;
          if (options.tabs != initial) {
            if (options.tabs) {
              $.each(_tabs, function(idx, value) {
                if (options.url == value.href) value.active(true, false);
              });
              domNodes.tabsBar.prependTo(domNodes.wrapper);
            } else
              domNodes.tabsBar.detach();
          }
          break;
        default:
          if (console) {
            console.log('Cannot set "' + prop + '".');
          }
          break;
        }
      });
      if (options.width < options.minWidth) {
        options.width = options.minWidth;
      }
      if (options.height < options.minHeight) {
        options.height = options.minHeight;
      }
      fitInViewport();
      return $jWindow;
    };

    // ------------
    // JWINDOW TABS
    // ------------

    /**
     * Array of tabs
     */
    var _tabs = [ ];

    // ----------------------------
    // JWINDOW TABS PRIVATE METHODS
    // ----------------------------

    /**
     * The tab
     * 
     * @param params
     *          An object containing two properties: href (the iframe's src attribute) and title (the text of the tab's
     *          anchor)
     */
    function jWindowTab(params) {
      if (typeof params.href == 'undefined' || typeof params.title == 'undefined') throw "Missing parametres!";

      var $tab = this;
      $tab.href = params.href;
      $tab.title = params.title;
      var isActive = false;
      var id = tabCounter++;

      $tab.name = (typeof params.name != 'undefined') ? params.name : null;

      /**
       * Retrieve the tab's ID
       * 
       * @return the tab's ID
       */
      $tab.getId = function() {
        return id;
      };

      /**
       * Get or set the active status. Without a parametre, the function acts as a getter. Otherwise, it is a setter.
       * 
       * @param active
       *          whether the tab is to be activated or deactivated.
       * @param update
       *          whether to update the window contents or not. Defaults to false.
       * @return a boolean indicating whether the tab is active or not
       */
      $tab.active = function(active, update) {
        if (typeof active != 'undefined') {
          active = !!active;

          update = (typeof update != 'undefined') ? !!update : false;

          // remove the window content if a currently active tab is being deactivated
          if (isActive && !active && update) {
            $jWindow.update(null);
          }

          // update the window contents if an inactive tab is being activated
          if (!isActive && active && update) {
            $jWindow.update($tab.href);
          }

          isActive = active;

          // add/remove classes as needed
          if (active) $tab.domNode.addClass('active');
          else
            $tab.domNode.removeClass('active');
        }
        return isActive;
      };

      $tab.domNode = $('<li class="jWindow-tab">' + $tab.title + '</li>').css({
        display: 'inline-block',
        cursor: 'pointer'
      }).on({
        click: function(event) {
          event.preventDefault();
          $tab.domNode.trigger('jWindowOpenTab');
        },
        jWindowOpenTab: function() {
          $.each(_tabs, function(idx, value) {
            value.active(false);
          });
          $tab.active(true, true);
        },
        jWindowCloseTab: function() {
          $tab.domNode.detach();
          $tab.active(false, true);
          var toRemove = 0;
          $.each(_tabs, function(idx, value) {
            if (console) {
              console.log(value.getId());
            }
            if (value.getId() == id) {
              toRemove = idx;
            }
          });
          _tabs.splice(toRemove, 1);
        }
      });
    }
    ;

    /**
     * Check whether the tab name is already taken.
     * 
     * @param params
     *          The parametres, as passed to the appendTab/prependTab methods
     * @return boolean <code>true</code> if the name is free, <code>false</code> otherwise
     */
    var checkTabNameAvailability = function(params) {
      var ret = true;
      if (typeof params.name != 'undefined' && params !== null) {
        $.each(_tabs, function(idx, value) {
          if (value.name == params.name) {
            if (console) {
              console.log('Tab name must be unique.');
            }
            ret = false;
          }
        });
      }
      return ret;
    };

    // ---------------------------
    // JWINDOW TABS PUBLIC METHODS
    // ---------------------------

    /**
     * Append a new tab to the tabs list
     * 
     * @param params
     *          an object of parametres:<br>
     *          href - the URL of the content the tab will link to (mandatory)<br>
     *          title - the text displayed on the tab (mandatory)<br>
     *          name - a custom unique name for tab referencing (optional)
     * @return jWindow Provides a fluent interface
     */
    $jWindow.appendTab = function(params) {
      if (checkTabNameAvailability(params)) {
        var t = new jWindowTab(params);
        _tabs.push(t);
        t.domNode.appendTo(domNodes.tabs);
      }
      return $jWindow;
    };

    /**
     * Prepend a new tab to the tabs list
     * 
     * @param params
     *          an object of parametres:<br>
     *          href - the URL of the content the tab will link to (mandatory)<br>
     *          title - the text displayed on the tab (mandatory)<br>
     *          name - a custom unique name for tab referencing (optional)
     * @return jWindow Provides a fluent interface
     */
    $jWindow.prependTab = function(params) {
      if (checkTabNameAvailability(params)) {
        var tmp = _tabs;
        var t = new jWindowTab(params);

        $.each(_tabs, function(idx, value) {
          value.domNode.detach();
        });

        _tabs = [t];
        $.each(tmp, function(idx, value) {
          _tabs.push(value);
        });
        $.each(_tabs, function(idx, value) {
          value.domNode.appendTo(domNodes.tabs);
        });
      }
      return $jWindow;
    };

    /**
     * Activate a tab and load the contents its href points to
     * 
     * @param name
     *          The name of the tab to open
     * @return jWindow Provides a fluent interface
     */
    $jWindow.openTab = function(name) {
      if (name === null) return $jWindow;
      $.each(_tabs, function(idx, value) {
        if (value.name == name) {
          value.domNode.trigger('jWindowOpenTab');
        }
      });
      return $jWindow;
    };

    /**
     * Deactivate and remove a tab
     * 
     * @param name
     *          The name of the tab to close
     * @return jWindow Provides a fluent interface
     */
    $jWindow.closeTab = function(name) {
      if (name === null) return $jWindow;
      $.each(_tabs, function(idx, value) {
        if (value.name == name) {
          value.domNode.trigger('jWindowCloseTab');
        }
      });
      return $jWindow;
    };
  }

  // Extend the jQuery object with the jWindow function
  $.extend({
    jWindow: function(param) {
      switch (typeof param) {
      case 'string':
        for (var i = 0; i < jWindows.length; ++i) {
          if (jWindows[i].get('id') == param) {
            if (console) {
              console.log('jWindow id ' + param + ' already exists.');
            }
            return jWindows[i];
          }
        }
        return null;
        break;
      case 'object':
        if (typeof param.id != 'string' || param.id.length == 0) {
          if (console) {
            console.log("An ID is required.");
          }
        } else {
          var tmp = new jWindow(param);
          var cmp = $.jWindow(param.id);
          if (cmp === null) {
            jWindows.push(tmp);
            return tmp;
          } else {
            if (console) {
              console.log('jWindow id ' + param.id + ' already exists.');
            }
            return cmp;
          }
        }
        break;
      default:
        if (console) {
          console.log("Bad or no parametre!");
        }
        break;
      }
    }
  });

  $.extend(true, $.jWindow, {
    getWindows: function() {
      return jWindows;
    },
    removeWindow: function(removeId) {

      for (var i = 0; i < jWindows.length; ++i) {
        if (jWindows[i].get('id') == removeId) {
          jWindows.splice(i, 1);
          break;
        }
      }
    }
  });
})(jQuery);
