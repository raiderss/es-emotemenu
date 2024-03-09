

const app = new Vue({
  el: '#app',
  data: {
    backgroundImageStyle: { backgroundImage: "url('assets/img/background.svg')"},
    ui:false,
    selectedItem: 0,
    lastAddedIndexFast1: null,
    lastAddedIndexFast2: null,
    selectedCategory:"Walking",
    slindex:0,
    fastTabs: {
      'fast:1': [
        { label: '', icon: '', args: '', bind: 'H', dropped: false, category: ''},
        { label: '', icon: '', args: '', bind: 'J', dropped: false, category: ''},
        { label: '', icon: '', args: '', bind: 'R', dropped: false, category: ''},
        { label: '', icon: '', args: '', bind: 'T', dropped: false, category: ''},
      ],
      'fast:2': [
        { label: '', icon: '', args: '', bind: 'S', dropped: false, category: ''},
        { label: '', icon: '', args: '', bind: 'X', dropped: false, category: ''},
        { label: '', icon: '', args: '', bind: 'B', dropped: false, category: ''},
        { label: '', icon: '', args: '', bind: 'Y', dropped: false, category: ''},
      ],
    },

    categories: [
      {icon:'👾', label: 'Walking' },
      {icon:'💃', label: 'Dance' },
      {icon:'😊', label: 'Smile' },
      {icon:'🎭', label: 'Misc' },
      {icon:'🎩', label: 'Props' },
      {icon:'🎩', label: 'Bar Dance' },
    ],
    emotes:{
    },
   },

   

   methods: {
    handleKeyUp(event) {
      this.checkKey(event.key);
    },

    checkKey(keyPressed) {
      keyPressed = keyPressed.toUpperCase();
      ['fast:1', 'fast:2'].forEach(slot => {
        const foundEmote = this.fastTabs[slot].find(emote => emote.bind && emote.bind.toUpperCase() === keyPressed);
        if (foundEmote && foundEmote.args !== '') {
          $.post(`https://${GetParentResourceName()}/playanim`, JSON.stringify({data: foundEmote}));
        }
      });
    },

    selectItem(index, ref, data) {
      this.selectedCategory = data.label;
      this.selectedItem = index;
      this.animateEmotes();
    },

    animateSelection(ref) {
      anime({
        targets: ref,
        scale: [
          { value: 1.05, duration: 100 },
          { value: 1, duration: 100 },
          { value: 1.05, duration: 100 },
          { value: 1, duration: 100 }
        ],
        easing: 'easeInOutQuad',
        complete: () => {
          this.resetAnimation(ref);
        }
      });
    },

    resetAnimation(ref) {
      anime({
        targets: ref,
        scale: 1,
        duration: 500,
        easing: 'easeOutQuad'
      });
    },

    handleScroll(direction) {
      if (this.ui){
        const categoryElement = this.$refs.category;
        const scrollAmount = 200; 
        const duration = 500;
        let targetValue = categoryElement.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
        anime({
          targets: categoryElement,
          scrollLeft: targetValue,
          duration: duration,
          easing: 'easeOutQuad'
        });
        if (direction === 'left') {
          this.animateText(this.$refs.QText);
        } else if (direction === 'right') {
          this.animateText(this.$refs.EText);
        }
      }
    },

    animateText(element) {
      anime({
        targets: element,
        translateX: [
          { value: -10, duration: 100 },
          { value: 0, duration: 100 }
        ],
        easing: 'easeInOutQuad'
      });
    },
    

    animateEmotes() {
      if (this.emotes && this.emotes[this.selectedCategory]) {
        this.emotes[this.selectedCategory].forEach((emote, index) => {
          let emoteRef = this.$refs[`emote-${index}`];
          if (emoteRef) {
            anime({
              targets: emoteRef,
              opacity: [0, 1],
              scale: [0.8, 1],
              easing: 'easeOutExpo',
              duration: 700,
              delay: index * 100,
            });
          }
        });
      } else {
        console.error('Emote verisi veya seçilen kategori mevcut değil:', this.emotes, this.selectedCategory);
      }
    },
    


  
    removeEmote(index, originSlot, keepBind = false) {
      if (this.emotes[originSlot] && index !== -1) {
        if (keepBind) {
          const currentBind = this.emotes[originSlot][index].bind;
          Vue.set(this.emotes[originSlot], index, { label: '', icon: '', args: '', bind: currentBind, dropped: false });
        } else {
          Vue.set(this.emotes[originSlot], index, { label: '', icon: '', args: '', bind: '', dropped: false });
        }
      }
    },
    
    animateDropArea() {
      anime({
        targets: this.$refs.dropArea,
        translateY: [-50, 0], 
        scale: [0.95, 1], 
        opacity: [0, 1],
        easing: 'easeOutBack', 
        duration: 800, 
      });
    },
  
    allowDrop(event) {
      event.preventDefault();
    },
    


    
    Get(event, index, data) {
      if (event.type === 'click') {
        this.slindex = index;
        const selectedEmote = this.validEmotes[index];
      }
    },
    
   
    handleEventMessage(event) {
      let animationInProgress = false;
      const item = event.data;
      switch (item.data) {
        case 'GET':
        this.ui = true;
        document.querySelectorAll('.fast-slot-1 .emote-container, .fast-slot-2 .emote-container').forEach(el => {
          el.style.display = '';
      });
      anime({
          targets: '.fast-slot-1 .emote-container, .fast-slot-2 .emote-container',
          translateX: function(el) {
              return el.classList.contains('fast-slot-1') ? [100, 0] : [-100, 0];
          },
          opacity: [0, 1],
          easing: 'easeOutExpo',
          delay: anime.stagger(50),
          duration: 500, 
      });
          
          if (item.emote && typeof item.emote === 'object') {
            this.$set(this, 'emotes', item.emote);
            Object.keys(this.emotes).forEach(key => {
              this.$set(this.emotes, key, this.emotes[key]);
            });
          } else {
            console.error("Emote verisi beklenen formatta değil:", item.emote);
          }
          this.$nextTick(() => {
            document.querySelectorAll('.fast-slot-1 .emote-container, .fast-slot-2 .emote-container').forEach(el => {
              el.style.display = ''; 
            });
            anime({
              targets: '.fast-slot-1 .emote-container',
              translateX: [100, 0], 
              opacity: [0, 1],
              delay: anime.stagger(100),
              easing: 'easeOutExpo'
            });
            anime({
              targets: '.fast-slot-2 .emote-container',
              translateX: [-100, 0], 
              opacity: [0, 1],
              delay: anime.stagger(100), 
              easing: 'easeOutExpo'
            });
          });
          break;
          case 'FAST':
            if (item.status && !animationInProgress) {
                animationInProgress = true;
                document.querySelectorAll('.fast-slot-1 .emote-container, .fast-slot-2 .emote-container').forEach(el => {
                    el.style.display = '';
                });
                anime({
                    targets: '.fast-slot-1 .emote-container, .fast-slot-2 .emote-container',
                    translateX: function(el) {
                        return el.classList.contains('fast-slot-1') ? [100, 0] : [-100, 0];
                    },
                    opacity: [0, 1],
                    easing: 'easeOutExpo',
                    delay: anime.stagger(50),
                    duration: 500,
                    complete: function() {
                        animationInProgress = false;
                    }
                });
            } else if (!item.status && !animationInProgress) {
                animationInProgress = true;
                anime({
                    targets: '.fast-slot-1 .emote-container, .fast-slot-2 .emote-container',
                    translateX: function(el) {
                        return el.classList.contains('fast-slot-1') ? 100 : -100;
                    },
                    opacity: [1, 0],
                    easing: 'easeInExpo',
                    delay: anime.stagger(50),
                    duration: 500,
                    complete: function() {
                        document.querySelectorAll('.fast-slot-1 .emote-container, .fast-slot-2 .emote-container').forEach(el => {
                            el.style.display = 'none';
                        });
                        animationInProgress = false;
                    }
                });
            }
        break;
      }
    },

   
    },

    created() {
      window.addEventListener('message', this.handleEventMessage);
    },

    watch: {
      ui(newValue) {
        if (newValue){
          document.querySelectorAll('.fast-slot-1 .emote-container, .fast-slot-2 .emote-container').forEach(el => {
            el.style.display = '';
        });
        anime({
            targets: '.fast-slot-1 .emote-container, .fast-slot-2 .emote-container',
            translateX: function(el) {
                return el.classList.contains('fast-slot-1') ? [100, 0] : [-100, 0];
            },
            opacity: [0, 1],
            easing: 'easeOutExpo',
            delay: anime.stagger(50),
            duration: 500, 
        });
        }else {
          anime({
            targets: '.fast-slot-1 .emote-container, .fast-slot-2 .emote-container',
            translateX: function(el) {
                return el.classList.contains('fast-slot-1') ? 100 : -100;
            },
            opacity: [1, 0],
            easing: 'easeInExpo',
            delay: anime.stagger(50), 
            duration: 500, 
            complete: function() {
                document.querySelectorAll('.fast-slot-1 .emote-container, .fast-slot-2 .emote-container').forEach(el => {
                    el.style.display = 'none';
                });
            }
        });
        }
      }
      
    },

    mounted(){
      document.addEventListener('keyup', this.handleKeyUp);

      let fastSlot1AnimationPromise = anime({
        targets: '.fast-slot-1 .emote-container',
        translateX: 100, 
        opacity: [1, 0], 
        easing: 'easeInExpo',
        delay: anime.stagger(10),
        duration: 250, 
      }).finished;
    
      let fastSlot2AnimationPromise = anime({
        targets: '.fast-slot-2 .emote-container',
        translateX: -100, 
        opacity: [1, 0], 
        easing: 'easeInExpo',
        delay: anime.stagger(10),
        duration: 250, 
      }).finished;
    
      Promise.all([fastSlot1AnimationPromise, fastSlot2AnimationPromise]).then(() => {
        document.querySelectorAll('.fast-slot-1 .emote-container, .fast-slot-2 .emote-container').forEach(el => {
          el.style.display = 'none'; 
        });
      });
    },
    
    computed: {
      validEmotes() {
        if (this.selectedCategory && this.emotes[this.selectedCategory]) {
          return this.emotes[this.selectedCategory];
        }
        return [];
      },
    }
  })


  document.onkeyup = function (data) {
    if (app.ui){      
      const keyPressed = data.key.toUpperCase();
      Object.keys(app.fastTabs).forEach(slot => {
        app.fastTabs[slot].forEach((emote, index) => {
          if (emote.bind === keyPressed) {
            const selectedEmote = app.validEmotes[app.slindex];
            if (selectedEmote) {
              Vue.set(app.fastTabs[slot], index, {
                label: selectedEmote.label,
                icon: selectedEmote.icon,
                args: selectedEmote.args,
                bind: keyPressed,
                dropped: true,
                category: selectedEmote.category 
              });
            }
          }
        });
      });
    }
    



  
    switch (data.key) {
      case 'Escape':
        case 'Escape':
          let fastSlot1AnimationPromise = anime({
            targets: '.fast-slot-1 .emote-container',
            translateX: 100, 
            opacity: [1, 0], 
            easing: 'easeInExpo',
            delay: anime.stagger(10),
            duration: 250, 
          }).finished;
        
          let fastSlot2AnimationPromise = anime({
            targets: '.fast-slot-2 .emote-container',
            translateX: -100, 
            opacity: [1, 0], 
            easing: 'easeInExpo',
            delay: anime.stagger(10),
            duration: 250, 
          }).finished;
        
          Promise.all([fastSlot1AnimationPromise, fastSlot2AnimationPromise]).then(() => {
            document.querySelectorAll('.fast-slot-1 .emote-container, .fast-slot-2 .emote-container').forEach(el => {
              el.style.display = 'none'; 
            });
            app.ui = false; 
            $.post(`https://${GetParentResourceName()}/exit`, JSON.stringify({})); 
          });
      break;
      case 'Q':
      case 'q':
        app.handleScroll('left');
      break;
      case 'E':
      case 'e':
        app.handleScroll('right');
        break;
    }
  };
  
  

  