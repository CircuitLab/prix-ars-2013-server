
set :user, 'deploy'

set :application, "prix-ars-2013-server"
set :repository,  "git@github.com:uniba/#{application}.git"

set :scm, :git
set :scm_verbose, true
set :git_shallow_clone, 1

set :deploy_to, "/home/uniba/app/#{application}"
set :deploy_via, :remote_cache

set :use_sudo, false

set :node_port, 80
set :process_uid, user

role :app, 'prix-ars-2013.aws.uniba.jp'

default_run_options[:pty] = true
ssh_options[:forward_agent] = true

namespace :deploy do
  task :start, :roles => :app do
    sudo "#{process_env} forever start #{current_path}/app.js"
  end
  task :stop, :roles => :app do
    sudo "forever stop #{current_path}/app.js"
  end
  task :restart, :roles => :app, :except => { :no_release => true } do
    sudo "#{process_env} forever restart #{current_path}/app.js"
  end
end

after "deploy:create_symlink", :roles => :app do
  run "ln -svf #{shared_path}/node_modules #{current_path}/node_modules"
  run "cd #{current_path} && npm i"
end

after "deploy:setup", :roles => :app do
  run "mkdir -pv #{shared_path}/node_modules"
  run "mkdir -pv #{shared_path}/backup"
    
  # mongodb
  run "test -s /etc/yum.repos.d/10gen.repo || sudo cat <<_EOT_
[10gen]
name=10gen Repository
baseurl=http://downloads-distro.mongodb.org/repo/redhat/os/x86_64
gpgcheck=0
enabled=0'
_EOT_ > /etc/yum.repos.d/10gen.repo"
  sudo "yum --enablerepo=10gen install -y mongo-10gen mongo-10gen-server"
  sudo "service mongod start"
  sudo "chkconfig mongod on"
    
  # node
  run <<-EOM
    grep '.nodebrew/current/bin' ~/.bashrc \
      || curl https://raw.github.com/hokaccha/nodebrew/master/nodebrew | perl - setup \
      && echo 'export PATH=$HOME/.nodebrew/current/bin:$PATH' >> ~/.bashrc
  EOM
  run "source ~/.bashrc"
  run "test -d .nodebrew/node/v0.8.16 || nodebrew install-binary 0.8.18"
  run "nodebrew use 0.8.18"
  run "npm -g up"
  
  # forever
  run "npm -g install forever"
end