document.onreadystatechange = function () {
  if (document.readyState === 'interactive') renderApp();

  function renderApp() {
    var onInit = app.initialized();

    onInit
      .then(function getClient(_client) {
        window.client = _client;
        client.events.on('app.activated', vm.init());
      })
      .catch(handleErr);
  }
};

function handleErr(err = 'None') {
  console.error(`Error occured. Details:`, err);
}

const App = {
  data() {
    return {
      links: [],
      showAddLinkForm: false,
      newTitle: '',
      newLink: '',
    };
  },
  methods: {
    init() {
      client.db.get('user').then(
        function (data) {
          vm.links = data.links;
        },
        function (error) {
          console.error(`Some error Encountered: ${error}`);
        }
      );
    },

    /**
     * @param {string} this.newTitle - title of new link to be saved
     * @param {string} this.newLink - url of new link to be saved
     */
    saveLink() {
      client.db
        .update('user', 'append', {
          links: [{ title: this.newTitle, url: this.newLink }],
        })
        .then(
          function (data) {
            console.log(data);
            vm.showAddLinkForm = false;
            vm.showNotify('Link saved successfully!');
            vm.clearInputFields();
          },
          function (error) {
            console.error(`Some error Encountered: ${error}`);
          }
        );

      this.init();
    },

    deleteLink(index) {
      vm.links.splice(index, 1);

      client.db.delete('user');

      vm.links.forEach((link) => {
        client.db
          .update('user', 'append', {
            links: [{ title: link.title, url: link.url }],
          })
          .then(
            function (data) {
              console.log(data);
              vm.notify('success', 'Link deleted successfully!');
              vm.init();
            },
            function (error) {
              console.error(`Some error Encountered: ${error}`);
            }
          );
      });
    },

    notify(type, text) {
      client.interface
        .trigger('showNotify', {
          type: type,
          message: text,
        })
        .then(function (data) {
          console.log(data);
        })
        .catch(function (error) {
          console.error(`Some error Encountered: ${error}`);
        });
    },

    /* Reset form fields */
    clearInput() {
      this.newTitle = '';
      this.newLink = '';
    },
  },
};

var vm = Vue.createApp(App).mount('#app-body');

new ClipboardJS('.btn', {
  text: function (trigger) {
    return trigger.getAttribute('aria-label');
  },
});
