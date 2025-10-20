import React, { Component } from 'react';
import openSocket from 'socket.io-client';
const socket = openSocket('http://localhost:3001');

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            channelSelected: '#accueil',
            username: 'invité',
            usertemp: '',
            temp: '',
            tempMessage: '',
            channels: [],
            messages: [],
            users: [],
            isConnected: false,
            currentTime: new Date().toLocaleTimeString()
        }
        this.onChange = this.onChange.bind(this);
        this.handlePseudo = this.handlePseudo.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleMessage = this.handleMessage.bind(this);
        this.formatTime = this.formatTime.bind(this);
        this.getUserInitials = this.getUserInitials.bind(this);
    }

    componentDidMount() {
        // Mettre à jour l'heure toutes les secondes
        this.timeInterval = setInterval(() => {
            this.setState({ currentTime: new Date().toLocaleTimeString() });
        }, 1000);

        /*
        * Connexion d'un utilisateur
        */
        socket.on('newuser', (user) => {
            this.setState(prevState => ({
                messages: prevState.messages.concat({
                    channel: '#accueil', // Messages système vont dans le channel principal
                    author: 'system',
                    content: `🎉 ${user.username} a rejoint le channel`,
                    to: '',
                    chucho: 'no',
                    timestamp: new Date()
                })
            }));
            this.scrollToBottom();
        });

        /*
        * Rename d'un utilisateur
        */
        socket.on('renameuser', (user) => {
            this.setState(prevState => ({
                messages: prevState.messages.concat({
                    channel: '#accueil',
                    author: 'system',
                    content: `✏️ ${user.username} a changé son pseudo en ${user.rename}`,
                    to: '',
                    chucho: 'no',
                    timestamp: new Date()
                })
            }));
            this.scrollToBottom();
        });

        /*
        * Deconnexion d'un utilisateur
        */
        socket.on('disuser', (user) => {
            this.setState(prevState => ({
                messages: prevState.messages.concat({
                    channel: '#accueil',
                    author: 'system',
                    content: `👋 ${user.username} a quitté le channel`,
                    to: '',
                    chucho: 'no',
                    timestamp: new Date()
                })
            }));
            this.scrollToBottom();
        });

        /*
        * Affichage des utilisateurs
        */
        socket.on('listUsers', (user) => {
            this.setState({ users: user.user || [] });
        });

        /*
        * Définir les messages
        */
        socket.on('newmsg', (message) => {
            const msg = message.messages.messages || message.messages;
            this.setState(prevState => ({
                messages: prevState.messages.concat({
                    channel: msg.channel,
                    author: msg.author,
                    content: msg.content,
                    to: msg.to || '',
                    chucho: msg.chucho || 'no',
                    timestamp: new Date()
                })
            }));
            this.scrollToBottom();
        });

        /*
        * Réception des channels
        */
        socket.on('listChannels', (channels) => {
            this.setState({ channels: channels.channels || [] });
        });
    }

    componentWillUnmount() {
        if (this.timeInterval) {
            clearInterval(this.timeInterval);
        }
    }

    scrollToBottom() {
        setTimeout(() => {
            const messagesContainer = document.querySelector('.chat-messages');
            if (messagesContainer) {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
        }, 100);
    }

    formatTime(date) {
        return date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
    }

    getUserInitials(username) {
        return username ? username.substring(0, 2).toUpperCase() : '??';
    }

    /*
    * Pour la connexion
    */
    onChange(event) {
        this.setState({ usertemp: event.target.value });
    }

    handlePseudo(event) {
        event.preventDefault();
        if (this.state.usertemp.trim()) {
            socket.emit('login', { username: this.state.usertemp.trim() });
            this.setState({
                username: this.state.usertemp.trim(),
                isConnected: true
            });
        }
    }

    /*
    * Fonction pour commande /msg
    */
    commandMsg(tab) {
        if (tab.length >= 3) {
            const recipient = tab[1];
            const messageContent = tab.slice(2).join(' ');
            
            // Vérifier que l'utilisateur existe
            if (this.state.users.includes(recipient)) {
                this.setState({
                    tempMessage: {
                        channel: this.state.channelSelected,
                        author: this.state.username,
                        content: messageContent,
                        to: recipient,
                        chucho: 'yes',
                        timestamp: new Date()
                    }
                });
            } else {
                this.showSystemMessage(`❌ L'utilisateur ${recipient} n'est pas connecté.`);
            }
        } else {
            this.showSystemMessage('❌ Usage: /msg [utilisateur] [message]');
        }
    }


    /*
    * Fonction pour commande /nick
    */
    commandName(tab) {
        const newUsername = tab[1].trim();
        if (newUsername && newUsername !== this.state.username) {
            socket.emit('reName', {
                userName: this.state.username,
                rename: newUsername
            });
            this.setState({ username: newUsername });
            this.showSystemMessage(`✅ Votre pseudo a été changé en: ${newUsername}`);
        } else {
            this.showSystemMessage('❌ Veuillez choisir un pseudo différent et valide.');
        }
    }

    /*
    * Fonction pour commande /create
    */
    commandCreate(tab) {
        const channelName = tab[1].trim();
        const fullChannelName = channelName.startsWith('#') ? channelName : '#' + channelName;
        
        // Vérifier si le channel existe déjà
        const existingChannel = this.state.channels.find(channel => channel === fullChannelName);
        
        if (!existingChannel) {
            // Créer le nouveau channel
            socket.emit('newChannel', {
                channel: channelName.replace('#', '')
            });
            
            this.showSystemMessage(`✅ Le channel ${fullChannelName} a été créé avec succès !`);
            
            // Rejoindre automatiquement le nouveau channel
            setTimeout(() => {
                this.setState({ channelSelected: fullChannelName });
            }, 500);
        } else {
            this.showSystemMessage(`❌ Le channel ${fullChannelName} existe déjà.`);
        }
    }

    /*
    * Fonction pour commande /join
    */
    commandJoin(tab) {
        let channelName = tab[1].trim();
        
        // Ajouter # si pas présent
        if (!channelName.startsWith('#')) {
            channelName = '#' + channelName;
        }
        
        // Vérifier si le channel existe
        if (this.state.channels.includes(channelName)) {
            this.setState({ channelSelected: channelName });
            this.showSystemMessage(`✅ Vous avez rejoint ${channelName}`);
        } else {
            this.showSystemMessage(`❌ Le channel ${channelName} n'existe pas. Utilisez /create pour le créer.`);
        }
    }


    /*
    * Pour l'envoi de message
    */
    handleChange(event) {
        this.setState({ temp: event.target.value });
        const inputValue = event.target.value;
        const tab = inputValue.split(' ');
        
        // Préparer le message temporaire seulement si ce n'est pas une commande
        if (!inputValue.startsWith('/')) {
            this.setState({
                tempMessage: {
                    channel: this.state.channelSelected,
                    author: this.state.username,
                    content: inputValue,
                    to: '',
                    chucho: 'no',
                    timestamp: new Date()
                }
            });
        } else if (tab[0] === '/msg' && tab.length >= 3) {
            // Préparer le message privé
            const recipient = tab[1];
            const messageContent = tab.slice(2).join(' ');
            this.setState({
                tempMessage: {
                    channel: this.state.channelSelected,
                    author: this.state.username,
                    content: messageContent,
                    to: recipient,
                    chucho: 'yes',
                    timestamp: new Date()
                }
            });
        }
    }

    /*
    * Confirmation du formulaire / envoi de message
    */
    handleMessage(event) {
        event.preventDefault();
        const inputValue = this.state.temp.trim();
        
        if (!inputValue) return;
        
        const tab = inputValue.split(' ');
        const command = tab[0];
        
        // Traitement des commandes
        if (command === '/nick') {
            if (tab[1] && tab[1].trim()) {
                this.commandName(tab);
            } else {
                this.showSystemMessage('❌ Usage: /nick [nouveau_pseudo]');
            }
        } else if (command === '/create') {
            if (tab[1] && tab[1].trim()) {
                this.commandCreate(tab);
            } else {
                this.showSystemMessage('❌ Usage: /create [nom_du_channel]');
            }
        } else if (command === '/join') {
            if (tab[1] && tab[1].trim()) {
                this.commandJoin(tab);
            } else {
                this.showSystemMessage('❌ Usage: /join [nom_du_channel]');
            }
        } else if (command === '/msg') {
            if (tab.length >= 3) {
                // Message privé - envoyer le message temporaire préparé
                socket.emit('newmessage', { messages: this.state.tempMessage });
            } else {
                this.showSystemMessage('❌ Usage: /msg [utilisateur] [message]');
            }
        } else if (command === '/help') {
            this.showHelpMessage();
        } else if (command.startsWith('/')) {
            this.showSystemMessage('❌ Commande inconnue. Tapez /help pour voir les commandes disponibles.');
        } else {
            // Message normal
            if (this.state.tempMessage && this.state.tempMessage.content) {
                socket.emit('newmessage', { messages: this.state.tempMessage });
            }
        }
        
        this.setState({ temp: '', tempMessage: '' });
    }

    /*
    * Afficher un message système local
    */
    showSystemMessage(content) {
        this.setState(prevState => ({
            messages: prevState.messages.concat({
                channel: this.state.channelSelected,
                author: 'system',
                content: content,
                to: '',
                chucho: 'no',
                timestamp: new Date()
            })
        }));
        this.scrollToBottom();
    }

    /*
    * Afficher l'aide
    */
    showHelpMessage() {
        const helpContent = `
📋 Commandes disponibles:
• /nick [pseudo] - Changer votre pseudo
• /create [channel] - Créer un nouveau channel
• /join [channel] - Rejoindre un channel
• /msg [user] [message] - Envoyer un message privé
• /help - Afficher cette aide
        `.trim();
        
        this.showSystemMessage(helpContent);
    }

    /*
    * Afficher les messages
    */
    affichMessage() {
        const filteredMessages = this.state.messages.filter(messages => messages.channel === this.state.channelSelected);
        return filteredMessages.map((message, index) => {
            const key = `msg-${index}-${message.timestamp || Date.now()}`;

            if (message.author === 'system') {
                return (
                    <div key={key} className="system-message">
                        <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
                        {message.content}
                    </div>
                );
            }

            if (message.to !== '' && message.to === this.state.username) {
                return (
                    <div key={key} className="message private-message">
                        <div className="message-avatar">
                            {this.getUserInitials(message.author)}
                        </div>
                        <div className="message-content">
                            <div className="message-header">
                                <span className="message-author">{message.author}</span>
                                <span className="message-time">{this.formatTime(message.timestamp)}</span>
                                <span style={{ color: '#fbbf24', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                                    <i className="fas fa-lock"></i> Message privé
                                </span>
                            </div>
                            <div className="message-text">{message.content}</div>
                        </div>
                    </div>
                );
            }

            if (message.to !== '' && message.author === this.state.username) {
                return (
                    <div key={key} className="message private-message">
                        <div className="message-avatar">
                            {this.getUserInitials(message.author)}
                        </div>
                        <div className="message-content">
                            <div className="message-header">
                                <span className="message-author">Vous</span>
                                <span className="message-time">{this.formatTime(message.timestamp)}</span>
                                <span style={{ color: '#fbbf24', marginLeft: '0.5rem', fontSize: '0.8rem' }}>
                                    <i className="fas fa-arrow-right"></i> à {message.to}
                                </span>
                            </div>
                            <div className="message-text">{message.content}</div>
                        </div>
                    </div>
                );
            }

            if (message.author !== 'system' && message.chucho === 'no') {
                return (
                    <div key={key} className="message">
                        <div className="message-avatar">
                            {this.getUserInitials(message.author)}
                        </div>
                        <div className="message-content">
                            <div className="message-header">
                                <span className="message-author">{message.author}</span>
                                <span className="message-time">{this.formatTime(message.timestamp)}</span>
                            </div>
                            <div className="message-text">{message.content}</div>
                        </div>
                    </div>
                );
            }
            return null;
        });
    }

    /*
    *  Afficher les membres
    */
    affichMembers() {
        return this.state.users.map((user, index) => {
            return (
                <div key={`user-${index}`} className="user-item">
                    <div className="user-item-avatar">
                        {this.getUserInitials(user)}
                    </div>
                    <span>{user}</span>
                    <div className="user-status"></div>
                </div>
            );
        });
    }

    /*
    *  Afficher les channels
    */
    affichChannels() {
        return this.state.channels.map((channel, index) => {
            return (
                <div
                    key={`channel-${index}`}
                    className={`channel-item ${channel === this.state.channelSelected ? 'active' : ''}`}
                    onClick={() => this.setState({ channelSelected: channel })}
                >
                    <i className="fas fa-hashtag"></i>
                    {channel.replace('#', '')}
                </div>
            );
        });
    }

    /*
    * Rendu
    */

    render() {
        if (this.state.username === 'invité') {
            return (
                <div className="app-container">
                    <div className="login-container">
                        <div className="login-card">
                            <div className="login-title">
                                <i className="fas fa-comments"></i> Épi'Chat
                            </div>
                            <p className="login-subtitle">
                                Connectez-vous pour rejoindre la conversation
                            </p>
                            
                            <form onSubmit={this.handlePseudo}>
                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="fas fa-user"></i> Votre pseudo
                                    </label>
                                    <input 
                                        className="form-input" 
                                        type="text" 
                                        placeholder="Entrez votre pseudo..."
                                        value={this.state.usertemp}
                                        onChange={this.onChange}
                                        autoFocus
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn">
                                    <i className="fas fa-sign-in-alt"></i>
                                    Se connecter
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            );
        }

        if (this.state.isConnected) {
            return (
                <div className="app-container">
                    <div className="chat-layout">
                        {/* Header */}
                        <header className="chat-header">
                            <div className="header-logo">
                                <i className="fas fa-comments"></i>
                                Épi'Chat
                            </div>
                            <div className="user-info">
                                <div className="user-avatar">
                                    {this.getUserInitials(this.state.username)}
                                </div>
                                <div>
                                    <div style={{fontWeight: '600'}}>{this.state.username}</div>
                                    <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>
                                        {this.state.currentTime}
                                    </div>
                                </div>
                            </div>
                        </header>

                        {/* Sidebar des channels */}
                        <aside className="channels-sidebar">
                            <h3 className="sidebar-title">
                                <i className="fas fa-list"></i> Channels
                            </h3>
                            <div className="channel-list">
                                {this.affichChannels()}
                            </div>
                            <div style={{marginTop: '2rem', padding: '1rem', background: 'var(--accent-bg)', borderRadius: '10px', fontSize: '0.9rem'}}>
                                <div style={{color: 'var(--text-muted)', marginBottom: '0.5rem'}}>
                                    <i className="fas fa-info-circle"></i> Commandes utiles:
                                </div>
                                <div style={{fontFamily: 'monospace', fontSize: '0.8rem', lineHeight: '1.8'}}>
                                    <code>/nick [pseudo]</code> - Changer de pseudo<br/>
                                    <code>/create [channel]</code> - Créer un channel<br/>
                                    <code>/join [channel]</code> - Rejoindre un channel<br/>
                                    <code>/msg [user] [message]</code> - Message privé
                                </div>
                            </div>
                        </aside>

                        {/* Zone de chat principale */}
                        <main className="chat-main">
                            <div className="chat-messages">
                                <div style={{textAlign: 'center', margin: '2rem 0', color: 'var(--text-muted)'}}>
                                    <i className="fas fa-hashtag" style={{fontSize: '2rem', marginBottom: '0.5rem'}}></i>
                                    <h2 style={{color: 'var(--text-primary)'}}>
                                        Bienvenue sur {this.state.channelSelected}
                                    </h2>
                                    <p>C'est le début de votre conversation dans ce channel.</p>
                                </div>
                                {this.affichMessage()}
                            </div>
                            
                            {/* Zone de saisie */}
                            <div className="message-input-container">
                                <form className="message-form" onSubmit={this.handleMessage}>
                                    <input
                                        className="message-input"
                                        type="text"
                                        placeholder={`Tapez votre message dans ${this.state.channelSelected}...`}
                                        value={this.state.temp}
                                        onChange={this.handleChange}
                                        autoComplete="off"
                                    />
                                    <button type="submit" className="send-button">
                                        <i className="fas fa-paper-plane"></i>
                                    </button>
                                </form>
                            </div>
                        </main>

                        {/* Sidebar des utilisateurs */}
                        <aside className="users-sidebar">
                            <h3 className="sidebar-title">
                                <i className="fas fa-users"></i> Membres ({this.state.users.length})
                            </h3>
                            <div className="user-list">
                                {this.affichMembers()}
                            </div>
                        </aside>
                    </div>
                </div>
            );
        }

        return null;
    }
}

export default App;
