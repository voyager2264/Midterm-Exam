// The TabWidget class includes code derived from WAI-ARIA examples:
// This software or document includes material copied from or derived from WAI-ARIA
// Authoring Practices 1.1, Example of Tabs with Automatic Activation.
// https://www.w3.org/TR/wai-aria-practices/examples/tabs/tabs-1/tabs.html
// Copyright © 2018 W3C® (MIT, ERCIM, Keio, Beihang).

window.onload = () => {
  const mainContent = document.getElementById('mainContent');
  const buyDialog = document.getElementById("buyDialog");
  const closeDialogButton = document.getElementById('dialogCloseButton');

	function buyButtonClicked() {
    console.log('buyButtonClicked');
		showDialog();
	}

	function submitButtonClicked() {
		alert("You submitted the form. Yay.");
		hideDialog();
	}

	function closeDialogButtonClicked() {
		hideDialog();
	}

	function hideDialog() {
    buyDialog.classList.add("isHidden");
    mainContent.focus();
	}

	function showDialog() {
    buyDialog.classList.remove("isHidden");
    buyDialog.focus();
	}

	// Sets up event listeners
	mainContent.addEventListener("click", (e) => {
		if (e.target.classList && e.target.classList.contains("buyButton")) {
			buyButtonClicked();
		}
	});
	document.getElementById("submitButton").addEventListener("click", (e) => {
		submitButtonClicked();
	});
	closeDialogButton.addEventListener("click", (e) => {
		closeDialogButtonClicked();
  });
  closeDialogButton.addEventListener("keydown", (e) => {
    if (e.key === "Tab" && e.shiftKey) {
      document.getElementById('wrapTarget').focus();
    }
  });

  const tabWidget = new TabWidget();
  // Initially activate the "Description" tab, without setting the focus
  tabWidget.activateTab(tabWidget.tabs[0], false);

  document.getElementById('returns').addEventListener('keydown', (e) => {
    if (e.key === "Tab" && (!e.shiftKey)) {
      //console.log('Wrap @ end');
      buyDialog.focus();
    }
  });
}

class TabWidget {
 constructor() {
  // For easy reference
  this.keys = {
    end: "End", // 35,
    home: "Home", // 36,
    left: "ArrowLeft", // 37,
    up: "ArrowUp", // 38,
    right: "ArrowRight", // 39,
    down: "ArrowDown" // 40,
  };

  // Add or subtract depending on key pressed
  this.direction = {
    'ArrowLeft': -1,
    'ArrowUp': -1,
    'ArrowRight': 1,
    'ArrowDown': 1
  };

  this.tablist = document.querySelectorAll('.tablist')[0];
  this.tabs;
  this.panels;
  this.delay = this.determineDelay();
  this.generateArrays();

  // Bind listeners
  for (let i = 0; i < this.tabs.length; ++i) {
    this.addTabListeners(i);
  };
 }
  
  generateArrays() {
    this.tabs = document.querySelectorAll('.tab');
    this.panels = document.querySelectorAll('.tabpanel');
  }

  addTabListeners(index) {
    this.tabs[index].addEventListener('click', (ev) => this.clickEventListener(ev));
    this.tabs[index].addEventListener('keydown', (ev) => this.keydownEventListener(ev));
    this.tabs[index].addEventListener('keyup', (ev) => this.keyupEventListener(ev));
    this.tabs[index].addEventListener('focus', (ev) => this.activateOnFocus(ev));

    // Build an array with all tabs (<button>s) in it
    this.tabs[index].index = index;
  }

  // When a tab is clicked, activateTab is fired to activate it
  clickEventListener (event) {
    var tab = event.target;
    //this.activateTab(tab, false);
  }

  // Handle keydown on tabs
  keydownEventListener(event) {
    var key = event.key;
    //console.log('Keydown: ' + key);
    switch (key) {
      case this.keys.end:
        event.preventDefault();
        // Activate last tab
        this.tabs[this.tabs.length - 1].focus();
        // this.activateTab(this.tabs[this.tabs.length - 1]);
        break;
      case this.keys.home:
        event.preventDefault();
        // Activate first tab
        this.tabs[0].focus();
        //this.activateTab(this.tabs[0]);
        break;

      // Up and down are in keydown
      // because we need to prevent page scroll >:)
      case this.keys.up:
      case this.keys.down:
        this.determineOrientation(event);
        break;
    };
  }

  // Handle keyup on tabs
  keyupEventListener(event) {
    var key = event.key;

    switch (key) {
      case this.keys.left:
      case this.keys.right:
        this.determineOrientation(event);
        break;
    };
  }

  activateOnFocus(event) {
    this.activateTab(event.target, false);
  }

  // When a tablist's aria-orientation is set to vertical,
  // only up and down arrow should function.
  // In all other cases only left and right arrow function.
  determineOrientation(event) {
    var key = event.key;
    var vertical = this.tablist.getAttribute('aria-orientation') == 'vertical';
    var proceed = false;

    if (vertical) {
      if (key === this.keys.up || key === this.keys.down) {
        event.preventDefault();
        proceed = true;
      };
    }
    else {
      if (key === this.keys.left || key === this.keys.right) {
        proceed = true;
      };
    };

    if (proceed) {
      this.switchTabOnArrowPress(event);
    };
  };

  // Either focus the next, previous, first, or last tab
  // depending on key pressed
  switchTabOnArrowPress(event) {
    var pressed = event.key;

    for (let x = 0; x < this.tabs.length; x++) {
      this.currentFocusEventHandler = (ev) => this.focusEventHandler(ev);
      this.tabs[x].addEventListener('focus', this.currentFocusEventHandler);
    };

    if (this.direction[pressed]) {
      var target = event.target;
      if (target.index !== undefined) {
        if (this.tabs[target.index + this.direction[pressed]]) {
          this.tabs[target.index + this.direction[pressed]].focus();
        }
        else if (pressed === this.keys.left || pressed === this.keys.up) {
          this.focusLastTab();
        }
        else if (pressed === this.keys.right || pressed == this.keys.down) {
          this.focusFirstTab();
        };
      };
    };
  };

  // Activates any given tab panel
  activateTab(tab, setFocus) {
    if (setFocus === undefined) {
      setFocus = true;
    }
    //  Bzzt.  setFocus will always be true after the following,
    //  which makes its value as a parameter kind of pointless.
    //setFocus = setFocus || true;
    // Deactivate all other tabs
    this.deactivateTabs();

    // Remove tabindex attribute
    tab.removeAttribute('tabindex');

    // Set the tab as selected
    tab.classList.add("selected");
    tab.setAttribute('aria-selected', 'true');

    // Get the id of the relevant tabpanel
    var controls = tab.getAttribute('id')  + '-tab';

    // Remove hidden attribute from tab panel to make it visible
    document.getElementById(controls).removeAttribute('hidden');

    // Set focus when required
    if (setFocus) {
      tab.focus();
    };
  }

  // Deactivate all tabs and tab panels
  deactivateTabs() {
    for (let t = 0; t < this.tabs.length; t++) {
      this.tabs[t].classList.remove("selected");
      this.tabs[t].setAttribute('aria-selected', 'false');
      if (this.currentFocusEventHandler) {
        this.tabs[t].removeEventListener('focus', this.currentFocusEventHandler);
      }
    };

    for (let p = 0; p < this.panels.length; p++) {
      this.panels[p].setAttribute('hidden', 'hidden');
    };
  }

  // Make a guess
  focusFirstTab () {
    this.tabs[0].focus();
  }

  // Make a guess
  focusLastTab () {
    this.tabs[this.tabs.length - 1].focus();
  }

  // Determine whether there should be a delay
  // when user navigates with the arrow keys
  determineDelay() {
    var hasDelay = this.tablist.hasAttribute('data-delay');
    var delay = 0;

    if (hasDelay) {
      var delayValue = this.tablist.getAttribute('data-delay');
      if (delayValue) {
        delay = delayValue;
      }
      else {
        // If no value is specified, default to 300ms
        delay = 300;
      };
    };
    return delay;
  }

  focusEventHandler(event) {
    var target = event.target;
    setTimeout((target) => this.checkTabFocus(target), this.delay, target);
  }

  // Only activate tab on focus if it still has focus after the delay
  checkTabFocus(target) {
    const focused = document.activeElement;

    if (target === focused) {
      this.activateTab(target, false);
    };
  }
}