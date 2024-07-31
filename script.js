const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const volBtn = $('.btn-volume')
const volBar = $('.volume-bar')
const iconMute = $('.icon-mute')
const iconUnmute = $('.icon-unmute')
const timeLeft = $(".time-left");
const timeRight = $(".time-right");

const app = {
    currentIndex: 0,
    currentVolume:1,
    lockVolume: 1,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Sugar',
            singer: 'Maroon 5',
            path: './song/1.mp3',
            image: './img/1.jpg'
        },
        {
            name: 'Đừng làm trái tim anh đau',
            singer: 'Sơn Tùng-MTP',
            path: './song/2.mp3',
            image: './img/2.jpg'
        },
        {
            name: 'Nobody',
            singer: 'Onerepublic',
            path: './song/3.mp3',
            image: './img/3.jpg'
        },
        {
            name: 'Gấp đôi yêu thương',
            singer: 'Tuấn Hưng',
            path: './song/4.mp3',
            image: './img/4.jpg'
        },
        {
            name: 'Nơi này có anh',
            singer: 'Sơn Tùng-MTP',
            path: './song/5.mp3',
            image: './img/5.jpg'
        },
        {
            name: 'Chạm đáy nỗi đau',
            singer: 'Mr.Siro',
            path: './song/6.mp3',
            image: './img/6.jpg'
        },
        {
            name: 'Tháng tư là lời nói dối của em',
            singer: 'Hà Anh Tuấn',
            path: './song/7.mp3',
            image: './img/7.jpg'
        },
        {
            name: 'Perfect',
            singer: 'Ed Sheeran',
            path: './song/8.mp3',
            image: './img/8.jpg'
        },
        {
            name: 'Lemon Tree',
            singer: 'Fool\'s Garden',
            path: './song/9.mp3',
            image: './img/9.jpg'
        },
        {
            name: '24h',
            singer: 'Lyly',
            path: './song/10.mp3',
            image: './img/10.jpg'
        },
        {
            name: 'We don\'t talk anymore',
            singer: 'Charlie Puth',
            path: './song/11.mp3',
            image: './img/11.jpg'
        },
    ],
    setConfig: function(key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = "${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });
        playlist.innerHTML = htmls.join('\n')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents :function() {
        const _this = this;
        const cdWidth = cd.offsetWidth;
        // lam dia quay
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,//10s
            iterations: Infinity
        });
        cdThumbAnimate.pause();

        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }
        //xu ly play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
                alert('Hiếu Đặng đẹp trai')
            }
        }

        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }
        // thanh tua
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100);
                progress.value = progressPercent
            }
        }
        // khi tua
        progress.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }
        // load ra độ dài của bài hát
        audio.addEventListener("loadedmetadata", function () {
            timeRight.textContent = _this.formatTime(audio.duration);
        });

        // load ra timeLeft khi thay đổi input
        progress.addEventListener('input', function (e) {
            const timeChange = (audio.duration / 100) * e.target.value
            timeLeft.textContent = _this.formatTime(timeChange)
        })

        // xử lý khi tiến độ bài hát thay đổi
        audio.addEventListener("timeupdate", function () {
            if (audio.duration) {
                const progressPercent = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progress.value = progressPercent;
                timeLeft.textContent = _this.formatTime(audio.currentTime);
            }
        });

        //khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else{
            _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollAcriveSong()
        }
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
            _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollAcriveSong()
        }
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom',_this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        //xu ly next khi ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
            _this.nextSong()
            }
            audio.play()
        }
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // click vao playlist
        playlist.onclick = function(e) {
            const activeSong = e.target.closest('.song:not(.active)');
            const optionSong = e.target.closest('.option');
            if(activeSong || optionSong) {
                if(activeSong) {
                    _this.currentIndex = Number(activeSong.dataset.index);
                    $('.song.active').classList.remove('active');
                    $$('.song')[_this.currentIndex].classList.add('active');
                    _this.loadCurrentSong();
                    audio.play();                    
                }
            }
        }
        //Volume-Bar       
        volBar.oninput = e => {
            this.setConfig("currentVolume", e.target.value);
            audio.volume = volBar.value;            
        }
        //Check-Volume
        if(_this.currentVolume > 0) {
            volBar.value = _this.currentVolume;
            audio.volume = _this.currentVolume;
            iconUnmute.style.visibility = 'visible';
            iconMute.style.visibility = 'hidden';
        } else {
            volBar.value = 0
            audio.volume = 0
            iconUnmute.style.visibility = 'hidden';
            iconMute.style.visibility = 'visible';
        }
        //Change-Volume
        audio.onvolumechange = () => {            
            volBar.value = audio.volume
            if(audio.volume === 0) {
                iconMute.style.visibility = 'visible';
                iconUnmute.style.visibility = 'hidden';
            } else {
                iconMute.style.visibility = 'hidden';
                iconUnmute.style.visibility = 'visible';
            }
        }
        //Unmute-Volume
        iconUnmute.onclick = (e) => {
            this.setConfig("lockVolume", audio.volume);
            audio.volume = 0;
            this.setConfig("currentVolume", audio.volume);
        }
        //Mute-Volume
        iconMute.onclick = (e) => {
            audio.volume = this.configs.lockVolume;
            this.setConfig("currentVol", audio.volume);
        }

    },
    scrollAcriveSong: function() {
        //Scroll-Frist/Last-Playlist
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'end'
            })
        }, 300)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path;
        this.setConfig('currentIndex', this.currentIndex);
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        this.currentIndex = this.config.currentIndex
        this.currentVolume = this.config.currentVolume
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex <0){
            this.currentIndex = this.songs.length
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    formatTime: function (time) {
        let minutes = Math.floor(time / 60);
        let seconds = Math.floor(time % 60);
        minutes = minutes < 10 ? "0" + minutes : minutes;
        seconds = seconds < 10 ? "0" + seconds : seconds;
        return minutes + ":" + seconds;
    },

    start: function() {
        this.loadConfig()
        this.defineProperties()
        this.handleEvents()
        this.loadCurrentSong()
        this.render()
        // hien thi trang thai ban dau cua btn repeat va random
        repeatBtn.classList.toggle('active', this.isRepeat)
        randomBtn.classList.toggle('active', this.isRandom)
        volume.value = this.currentVolume *100
    }
}

app.start()